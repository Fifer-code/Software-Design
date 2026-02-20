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
        <h2 className="thankyou-title">Thank You!</h2>
        <p className="thankyou-text">Your feedback has been submitted.</p>
      </div>
    </div>
  );
}

return (
  <div className="page-container">
    <h2 className="page-title feedback-title">Service Feedback</h2>

    <div className="card">
      <h3 className="feedback-subtitle">Rate Your Experience</h3>

      {/* //Star Rating */}
      <div className="feedback-stars">
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
        className="feedback-textarea"
        placeholder="Leave optional feedback..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button className="primary-btn" onClick={handleSubmit}>
        Submit Feedback
      </button>
    </div>
  </div>
);

}

export default Feedback;