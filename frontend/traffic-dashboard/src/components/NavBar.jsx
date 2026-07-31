import { Link } from "react-router-dom";

export default function Navbar() {
  const handleLogout = () => {
    window.location.href = "http://127.0.0.1:8000/auth/logout/";
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px 30px",
      background: "#111827",
      borderBottom: "1px solid #1f2937",
      alignItems: "center"
    }}>
      <h2 style={{ color: "#38bdf8", margin: 0 }}>🚦 Smart Traffic System</h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/" style={{ color: "#e5e7eb", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link to="/analytics" style={{ color: "#e5e7eb", textDecoration: "none" }}>
          Analytics
        </Link>
        <Link to="/incidents" style={{ color: "#e5e7eb", textDecoration: "none" }}>
          Incidents
        </Link>
        <Link to="/videoqa" style={{ color: "#e5e7eb", textDecoration: "none" }}>
          Video Q&A
        </Link>
        <a href="http://127.0.0.1:8000/api/traffic/incidents/" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e5e7eb", textDecoration: "none" }}>
            Manage Reports
        </a>
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}