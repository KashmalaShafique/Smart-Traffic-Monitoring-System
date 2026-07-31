import { useEffect, useState } from "react";
import axios from "axios";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState({ HIGH: 0, MEDIUM: 0, LOW: 0 });

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/nlp/")
      .then(res => {
        setIncidents(res.data.incidents || []);
        setSummary(res.data.summary || {});
      })
      .catch(err => console.log(err));
  }, []);

  const severityColors = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#22c55e"
  };

  const cardStyle = {
    background: "#111827",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #1f2937",
    flex: 1
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>📰 Live Traffic Incidents</h1>
      <p style={{ color: "#9ca3af" }}>
        Extracted from news and reports using NLP
      </p>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        <div style={{ ...cardStyle, borderTop: "4px solid #ef4444" }}>
          <h3 style={{ color: "#ef4444" }}>HIGH</h3>
          <h2>{summary.HIGH}</h2>
          <p style={{ color: "#9ca3af" }}>Critical Incidents</p>
        </div>
        <div style={{ ...cardStyle, borderTop: "4px solid #f59e0b" }}>
          <h3 style={{ color: "#f59e0b" }}>MEDIUM</h3>
          <h2>{summary.MEDIUM}</h2>
          <p style={{ color: "#9ca3af" }}>Moderate Incidents</p>
        </div>
        <div style={{ ...cardStyle, borderTop: "4px solid #22c55e" }}>
          <h3 style={{ color: "#22c55e" }}>LOW</h3>
          <h2>{summary.LOW}</h2>
          <p style={{ color: "#9ca3af" }}>Minor Incidents</p>
        </div>
      </div>

      {/* Incidents List */}
      <div style={{
        background: "#111827",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "30px",
        border: "1px solid #1f2937"
      }}>
        <h2>All Incidents</h2>
        {incidents.map((inc, i) => (
          <div key={i} style={{
            padding: "15px",
            marginTop: "12px",
            background: "#1f2937",
            borderRadius: "8px",
            borderLeft: `4px solid ${severityColors[inc.severity]}`
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span style={{
                color: severityColors[inc.severity],
                fontWeight: "bold",
                fontSize: "14px"
              }}>
                ● {inc.severity} SEVERITY
              </span>
              {inc.locations.length > 0 && (
                <span style={{ color: "#38bdf8", fontSize: "14px" }}>
                  📍 {inc.locations.join(", ")}
                </span>
              )}
            </div>
            <p style={{ color: "#e5e7eb", margin: 0 }}>{inc.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}