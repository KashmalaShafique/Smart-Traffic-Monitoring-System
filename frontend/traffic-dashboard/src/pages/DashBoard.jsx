import { useEffect, useState } from "react";
import TrafficSignal from "../components/TrafficSignal";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState({ latest: 0, avg: 0, max: 0, congestion: "LOW", accident: false });
  const [prediction, setPrediction] = useState(null);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      // Traffic data
      axios.get("http://127.0.0.1:8000/api/traffic/")
        .then(res => {
          setData(res.data);
          setAlert(res.data.accident);
        })
        .catch(err => console.log(err));

      // Prediction data
      axios.get("http://127.0.0.1:8000/api/prediction/")
        .then(res => setPrediction(res.data))
        .catch(err => console.log(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const cardStyle = {
    background: "#111827",
    padding: "20px",
    borderRadius: "12px",
    width: "200px",
    textAlign: "center",
    border: "1px solid #1f2937"
  };

  const congestionColor = {
    LOW: "#22c55e",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444"
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>📊 Live Traffic Dashboard</h1>

      {/* Accident Alert */}
      {alert && (
        <div style={{
          background: "#ef4444",
          padding: "15px",
          borderRadius: "10px",
          marginTop: "20px",
          fontWeight: "bold"
        }}>
          🚨 Accident Detected — Sudden traffic spike observed!
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>Current</h3>
          <h2>{data.latest}</h2>
        </div>
        <div style={cardStyle}>
          <h3>Average</h3>
          <h2>{data.avg}</h2>
        </div>
        <div style={cardStyle}>
          <h3>Maximum</h3>
          <h2>{data.max}</h2>
        </div>
        <div style={{ ...cardStyle, width: "220px" }}>
          <h3>Congestion</h3>
          <h2 style={{ color: congestionColor[data.congestion] || "#22c55e" }}>
            {data.congestion}
          </h2>
        </div>
      </div>

      {/* Traffic Signal */}
      <TrafficSignal value={data.latest} />

      {/* ML Prediction */}
      {prediction && (
        <div style={{
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "30px",
          border: "1px solid #1f2937"
        }}>
          <h2>🔮 Congestion Prediction</h2>
          <p>Current Prediction: <strong style={{
            color: congestionColor[prediction.current_prediction]
          }}>{prediction.current_prediction}</strong> ({prediction.confidence}% confidence)</p>
          <div style={{ display: "flex", gap: "15px", marginTop: "10px", flexWrap: "wrap" }}>
            {prediction.forecast && prediction.forecast.map((f, i) => (
              <div key={i} style={{ ...cardStyle, width: "150px" }}>
                <p>{f.hour}</p>
                <p style={{ color: congestionColor[f.predicted_congestion], fontWeight: "bold" }}>
                  {f.predicted_congestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Video Feed */}
      <h2 style={{ marginTop: "30px" }}>📹 Live Traffic Feed</h2>
      <img
        src="http://127.0.0.1:8000/video_feed/"
        style={{ width: "100%", borderRadius: "12px" }}
        alt="Traffic Feed"
      />
    </div>
  );
}