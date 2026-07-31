import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

export default function Analytics() {
  const [data, setData] = useState([]);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    // Traffic history
    axios.get("http://127.0.0.1:8000/api/traffic/")
      .then(res => setData(res.data.history || []))
      .catch(err => console.log(err));

    // Prediction forecast
    axios.get("http://127.0.0.1:8000/api/prediction/")
      .then(res => setPrediction(res.data))
      .catch(err => console.log(err));
  }, []);

  const latest = data.length ? data[data.length - 1].vehicle_count : 0;

  // Dynamic ceiling so Free Flow never goes to 0 even if latest count is large
  const maxCapacity = Math.max(latest * 1.5, 50);
  const pieData = [
    { name: "Traffic", value: latest },
    { name: "Free Flow", value: Math.max(0, Math.round(maxCapacity - latest)) }
  ];
  const colors = ["#ef4444", "#22c55e"];

  const severityColors = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#22c55e"
  };

  const sectionStyle = {
    background: "#111827",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "30px",
    border: "1px solid #1f2937"
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>📊 Advanced Traffic Analytics</h1>

      {/* Line Chart — Vehicle Count Over Time */}
      <div style={sectionStyle}>
        <h2>📈 Vehicle Count Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "none" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="vehicle_count"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              name="Vehicles"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart — Traffic by Time */}
      <div style={sectionStyle}>
        <h2>📊 Traffic Volume by Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "none" }}
            />
            <Legend />
            <Bar dataKey="vehicle_count" fill="#f59e0b" name="Vehicles" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart + Prediction side by side */}
      <div style={{ display: "flex", gap: "20px", marginTop: "30px", flexWrap: "wrap" }}>

        {/* Pie Chart */}
        <div style={{ ...sectionStyle, flex: 1, minWidth: "550px", minHeight: "480px" }}>
          <h2>🥧 Traffic Distribution</h2>
          <PieChart width={480} height={400}>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={120}
              cx="50%"
              cy="50%"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={{ stroke: "#94a3b8" }}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Forecast */}
        {prediction && (
          <div style={{ ...sectionStyle, flex: 1, minWidth: "300px" }}>
            <h2>🔮 Hourly Forecast</h2>
            <p style={{ color: "#9ca3af" }}>
              Next few hours prediction based on ML model
            </p>
            {prediction.forecast && prediction.forecast.map((f, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                marginTop: "10px",
                background: "#1f2937",
                borderRadius: "8px"
              }}>
                <span>{f.hour}</span>
                <span style={{
                  color: severityColors[f.predicted_congestion],
                  fontWeight: "bold"
                }}>
                  {f.predicted_congestion}
                </span>
                <span style={{ color: "#9ca3af" }}>{f.confidence}% confidence</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}