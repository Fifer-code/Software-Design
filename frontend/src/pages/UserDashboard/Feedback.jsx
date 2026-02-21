import { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import "/src/userdashboard.css";

const COMMENT_MAX = 500;

function Feedback() {
  const { addNotification } = useNotifications();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (comment.length > COMMENT_MAX) {
      newErrors.comment = `Comment cannot exceed ${COMMENT_MAX} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    addNotification("Thank you! Your feedback has been submitted.", "success");
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
        <h3 className="feedback-subtitle">Rate Your Experience *</h3>

        {/* Star Rating */}
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
        {errors.rating && (
          <span className="form-error">{errors.rating}</span>
        )}

        {/* Comment Box */}
        <textarea
          className={`feedback-textarea${errors.comment ? " input-error" : ""}`}
          placeholder="Leave optional feedback..."
          maxLength={COMMENT_MAX}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <span
          className={`char-count${comment.length > COMMENT_MAX ? " over-limit" : ""}`}
        >
          {comment.length}/{COMMENT_MAX}
        </span>
        {errors.comment && (
          <span className="form-error">{errors.comment}</span>
        )}

        <button className="primary-btn" onClick={handleSubmit}>
          Submit Feedback
        </button>
      </div>
    </div>
  );
}

export default Feedback;