export default function TrafficSignal({ value }) {
  let color = "green";
  let status = "LOW TRAFFIC";

  if (value > 15) {
    color = "red";
    status = "HIGH TRAFFIC";
  } else if (value > 8) {
    color = "orange";
    status = "MEDIUM TRAFFIC";
  }

  return (
    <div style={{
      padding: "15px",
      borderRadius: "12px",
      background: "#111827",
      textAlign: "center",
      marginTop: "20px"
    }}>
      <h3>🚦 Traffic Signal</h3>

      <div style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: color,
        margin: "10px auto"
      }} />

      <p>{status}</p>
    </div>
  );
}