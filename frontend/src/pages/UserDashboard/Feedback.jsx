import { useState } from "react";
import "/src/userdashboard.css";

function Feedback() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-container">
        <div className="card">
          <h2 style={{ color: "var(--main-ink)" }}>Thank You!</h2>
          <p style={{ color: "var(--main-muted)" }}>
            Your feedback has been submitted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title" style={{ color: "var(--main-ink)" }}>
        Service Feedback
      </h2>

      <div className="card">
        <h3 style={{ color: "var(--main-ink)" }}>Rate Your Experience</h3>

        {/* Star Rating */}
        <div style={{ fontSize: "28px", marginBottom: "15px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                cursor: "pointer",
                color: star <= rating ? "var(--main-accent-2)" : "var(--main-border)",
                transition: "color 0.2s",
                marginRight: "5px",
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment Box */}
        <textarea
          placeholder="Leave optional feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "10px",
            borderRadius: "8px",
            border: `1px solid var(--main-border)`,
            marginBottom: "15px",
            backgroundColor: "var(--main-card)",
            color: "var(--main-ink)",
            fontSize: "14px",
          }}
        />

        {/* Submit Button */}
        <button className="primary-btn" onClick={handleSubmit}>
          Submit Feedback
        </button>
      </div>
    </div>
  );
}

export default Feedback;