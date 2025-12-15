import React from "react";
import { useState } from "react";
import AlertPopup from "../components/AlertPopup.jsx";

function RomanticEmailSender() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "info" });

  const defaultMessage = "There's something special waiting for you 💖";

  const handleSendEmail = async () => {
    const finalMessage = message.trim() || defaultMessage;
    setLoading(true);
    setAlert({ message: "💌 Sending your message...", type: "info" });

    try {
   const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/send-email`, {  
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: finalMessage }),
});

      if (res.ok) {
        setAlert({ message: "💖 Your message was sent successfully!", type: "success" });
        setMessage("");
      } else {
        setAlert({ message: "❌ Failed to send email", type: "error" });
      }
    } catch (err) {
      setAlert({ message: "❌ Error sending email", type: "error" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefaultMessage = () => setMessage(defaultMessage);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff0f6",
        borderRadius: "12px",
        maxWidth: "500px",
        margin: "50px auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <h2 style={{ color: "#d63384", fontFamily: "cursive" }}>
        Send a Special Letter 💖
      </h2>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write something sweet for Faith..."
        rows={6}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #d63384",
          fontSize: "16px",
          marginBottom: "10px",
          resize: "none",
        }}
        disabled={loading}
      ></textarea>

      <button
        onClick={handleUseDefaultMessage}
        style={{
          padding: "8px 16px",
          backgroundColor: "#ff85c1",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "14px",
          marginBottom: "15px",
          opacity: loading ? 0.6 : 1,
        }}
        disabled={loading}
      >
        Use Default Message 💌
      </button>

      <button
        onClick={handleSendEmail}
        disabled={loading}
        style={{
          padding: "12px 24px",
          backgroundColor: loading ? "#ff9ccf" : "#ff69b4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          transform: loading ? "scale(0.95)" : "scale(1)",
          transition: "all 0.2s ease",
        }}
      >
        {loading ? "Sending..." : "Send 💌"}
      </button>

      {/* Alert popup */}
      <AlertPopup
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "info" })}
      />
    </div>
  );
}

export default RomanticEmailSender;
