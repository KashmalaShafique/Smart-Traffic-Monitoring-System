import { useState, useRef, useEffect } from "react";
import axios from "axios";

const COLORS = {
  bg: "#0a0f1e",
  card: "#111827",
  border: "#1e2d4a",
  accent: "#38bdf8",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#f59e0b",
  text: "#e2e8f0",
  muted: "#64748b",
};

export default function VideoQA() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [frames, setFrames] = useState([]);
  const [videoInfo, setVideoInfo] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractFrames = async (video) => {
    setExtracting(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const extracted = [];
    const duration = video.duration;
    const frameCount = Math.min(8, Math.floor(duration));
    const interval = duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
      await new Promise((resolve) => {
        video.currentTime = i * interval;
        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const frameData = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
          extracted.push(frameData);
          resolve();
        };
      });
    }

    setFrames(extracted);
    setVideoInfo({
      duration: Math.round(duration),
      width: video.videoWidth,
      height: video.videoHeight,
      frames: frameCount,
    });
    setExtracting(false);

    setMessages([{
      role: "assistant",
      text: `✅ Video loaded! I extracted ${frameCount} frames from a ${Math.round(duration)} second video. You can now ask me questions about this video OR run YOLO11 detection on it.`,
    }]);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setMessages([]);
    setFrames([]);
    setVideoInfo(null);
    setDetectionResult(null);
    const url = URL.createObjectURL(file);
    setVideoURL(url);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => extractFrames(video);
  };

  const runDetection = async () => {
    if (!videoFile) return;
    setDetecting(true);
    const formData = new FormData();
    formData.append("video", videoFile);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/videoqa/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDetectionResult(res.data);
    } catch (err) {
      setDetectionResult({ error: "Detection failed. Make sure Django server is running." });
    }
    setDetecting(false);
  };

  const askQuestion = async () => {
    if (!question.trim() || frames.length === 0 || loading) return;

    const userMessage = question.trim();
    setQuestion("");
    console.log("Sending question:", userMessage);
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("question", userMessage);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/videoqa/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const answer = response.data.answer || response.data.error || "Could not analyze video.";
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "Error analyzing video. Please try again.",
      }]);
    }
    setLoading(false);
  };

  const suggestedQuestions = [
    "How many vehicles are in this video?",
    "What is the traffic congestion level?",
    "What types of vehicles are visible?",
    "Is traffic moving freely or congested?",
    "Are there any trucks or buses?",
  ];

  const sectionStyle = {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px"
  };

  return (
    <div style={{ padding: "30px", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      <h1 style={{ fontSize: "26px", fontWeight: "bold", color: COLORS.accent, marginBottom: "8px" }}>
        🎥 Video Analysis
      </h1>
      <p style={{ color: COLORS.muted, marginBottom: "24px", fontSize: "14px" }}>
        Upload any traffic video — run YOLO11 detection or ask AI questions about it
      </p>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

        {/* Left Column */}
        <div style={{ flex: "1", minWidth: "300px" }}>

          {/* Upload */}
          <div
            onClick={() => fileInputRef.current.click()}
            style={{
              ...sectionStyle,
              border: `2px dashed ${videoURL ? COLORS.accent : COLORS.border}`,
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            {videoURL ? (
              <video
                ref={videoRef}
                src={videoURL}
                controls
                style={{ width: "100%", borderRadius: "8px", maxHeight: "250px" }}
              />
            ) : (
              <div style={{ padding: "40px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📹</div>
                <p style={{ color: COLORS.accent, fontWeight: "bold", margin: "0 0 8px" }}>
                  Click to Upload Video
                </p>
                <p style={{ color: COLORS.muted, fontSize: "13px", margin: 0 }}>
                  Supports MP4, AVI, MOV
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: "none" }}
          />

          {/* Video Info */}
          {videoInfo && (
            <div style={sectionStyle}>
              <p style={{ color: COLORS.accent, fontWeight: "bold", margin: "0 0 12px", fontSize: "14px" }}>
                📊 Video Info
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { label: "Duration", value: `${videoInfo.duration}s` },
                  { label: "Resolution", value: `${videoInfo.width}x${videoInfo.height}` },
                  { label: "Frames", value: videoInfo.frames },
                  { label: "File", value: videoFile?.name?.slice(0, 12) + "..." },
                ].map((item, i) => (
                  <div key={i} style={{ background: COLORS.bg, padding: "8px 12px", borderRadius: "8px" }}>
                    <p style={{ color: COLORS.muted, fontSize: "11px", margin: "0 0 2px" }}>{item.label}</p>
                    <p style={{ color: COLORS.text, fontSize: "13px", fontWeight: "bold", margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YOLO11 Detection */}
          {videoFile && (
            <div style={sectionStyle}>
              <p style={{ color: COLORS.accent, fontWeight: "bold", margin: "0 0 12px", fontSize: "14px" }}>
                🚗 YOLO11 Vehicle Detection
              </p>
              <p style={{ color: COLORS.muted, fontSize: "13px", marginBottom: "12px" }}>
                Run YOLO11 on this video to count vehicles and detect congestion level
              </p>
              <button
                onClick={runDetection}
                disabled={detecting}
                style={{
                  background: detecting ? COLORS.border : COLORS.green,
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  color: detecting ? COLORS.muted : "#000",
                  fontWeight: "bold",
                  cursor: detecting ? "not-allowed" : "pointer",
                  width: "100%",
                  fontSize: "14px"
                }}
              >
                {detecting ? "⚙️ Running Detection..." : "▶ Run YOLO11 Detection"}
              </button>

              {detectionResult && (
                <div style={{ marginTop: "16px" }}>
                  {detectionResult.error ? (
                    <p style={{ color: COLORS.red, fontSize: "13px" }}>{detectionResult.error}</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {[
                        { label: "Vehicle Count", value: detectionResult.vehicle_count || 0 },
                        { label: "Congestion", value: detectionResult.congestion || "N/A" },
                      ].map((item, i) => (
                        <div key={i} style={{
                          background: COLORS.bg, padding: "12px",
                          borderRadius: "8px", textAlign: "center"
                        }}>
                          <p style={{ color: COLORS.muted, fontSize: "11px", margin: "0 0 4px" }}>{item.label}</p>
                          <p style={{
                            color: item.label === "Congestion" ?
                              (item.value === "HIGH" ? COLORS.red :
                               item.value === "MEDIUM" ? COLORS.yellow : COLORS.green)
                              : COLORS.accent,
                            fontSize: "20px", fontWeight: "bold", margin: 0
                          }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Suggested Questions */}
          {frames.length > 0 && (
            <div style={sectionStyle}>
              <p style={{ color: COLORS.muted, fontSize: "13px", margin: "0 0 10px", fontWeight: "bold" }}>
                💡 Suggested Questions
              </p>
              {suggestedQuestions.map((q, i) => (
                <div
                  key={i}
                  onClick={() => setQuestion(q)}
                  style={{
                    padding: "8px 12px", marginBottom: "6px",
                    background: COLORS.bg, borderRadius: "8px",
                    cursor: "pointer", fontSize: "13px",
                    color: COLORS.muted, border: `1px solid ${COLORS.border}`,
                  }}
                >
                  {q}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column — Chat */}
        <div style={{ flex: "1.2", minWidth: "300px" }}>
          <div style={{
            ...sectionStyle,
            display: "flex", flexDirection: "column",
            height: "600px", marginBottom: 0
          }}>
            <div style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex", alignItems: "center", gap: "10px"
            }}>
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: frames.length > 0 ? COLORS.green : COLORS.muted
              }} />
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                {frames.length > 0 ? "AI Ready — Ask Anything" : "Upload a video to start"}
              </span>
            </div>


            <div style={{
              flex: 1, overflowY: "auto", padding: "16px",
              display: "flex", flexDirection: "column", gap: "12px"
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎥</div>
                  <p style={{ color: COLORS.muted, fontSize: "14px" }}>
                    Upload a traffic video to get started
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "85%", padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? COLORS.accent : "#1a2540",
                    color: msg.role === "user" ? "#000" : COLORS.text,
                    fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap"
                  }}>
                    {msg.role === "assistant" && <span style={{ marginRight: "6px" }}>🤖</span>}
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                    background: "#1a2540", color: COLORS.muted, fontSize: "14px"
                  }}>
                    🤖 Analyzing video frames...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{
              padding: "12px", borderTop: `1px solid ${COLORS.border}`,
              display: "flex", gap: "8px"
            }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                placeholder={frames.length > 0 ? "Ask anything about this video..." : "Upload a video first..."}
                disabled={frames.length === 0 || loading}
                style={{
                  flex: 1, background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px", padding: "10px 14px",
                  color: COLORS.text, fontSize: "14px", outline: "none",
                }}
              />
              <button
                onClick={askQuestion}
                disabled={frames.length === 0 || loading || !question.trim()}
                style={{
                  background: frames.length > 0 && question.trim() ? COLORS.accent : COLORS.border,
                  border: "none", borderRadius: "8px",
                  padding: "10px 18px",
                  color: frames.length > 0 && question.trim() ? "#000" : COLORS.muted,
                  fontWeight: "bold",
                  cursor: frames.length > 0 && question.trim() ? "pointer" : "not-allowed",
                  fontSize: "14px"
                }}
              >
                {loading ? "..." : "Ask"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}