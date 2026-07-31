import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/DashBoard";
import Analytics from "./pages/Analytics";
import Incidents from "./pages/Incidents";
import VideoQA from "./pages/VideoQA";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/videoqa" element={<VideoQA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;