import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import "/src/userdashboard.css";

const services = [
  { id: 1, name: "DMV", waitTime: 25 },
  { id: 2, name: "Banking Services", waitTime: 10 },
  { id: 3, name: "Student Advising", waitTime: 40 },
];

const NAME_MAX = 50;
const REASON_MAX = 150;

function JoinQueue() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [selectedService, setSelectedService] = useState("");
  const [fullName, setFullName] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    } else if (fullName.length > NAME_MAX) {
      newErrors.fullName = `Name cannot exceed ${NAME_MAX} characters`;
    }

    if (!selectedService) {
      newErrors.service = "Please select a service";
    }

    if (reason.length > REASON_MAX) {
      newErrors.reason = `Reason cannot exceed ${REASON_MAX} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const service = services.find((s) => s.id === Number(selectedService));

    // Store queue info in localStorage for QueueStatus page
    const queueEntry = {
      service: service.name,
      position: Math.floor(Math.random() * 8) + 1,
      estimatedWait: service.waitTime,
      status: "Waiting",
      joinedAt: new Date().toISOString(),
      fullName: fullName.trim(),
      reason: reason.trim(),
    };
    localStorage.setItem("currentQueue", JSON.stringify(queueEntry));

    addNotification(
      `You joined the ${service.name} queue. Estimated wait: ${service.waitTime} min.`,
      "success"
    );

    navigate("/user/status");
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Join a Queue</h2>

      <div className="card-grid">
        {services.map((service) => (
          <div className="card" key={service.id}>
            <h3>{service.name}</h3>
            <p>Estimated Wait: {service.waitTime} minutes</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Queue Registration</h3>
        <form onSubmit={handleJoin} noValidate>
          <div className="form-group-dashboard">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              maxLength={NAME_MAX}
              placeholder="Enter your full name"
              value={fullName}
              className={errors.fullName ? "input-error" : ""}
              onChange={(e) => setFullName(e.target.value)}
            />
            <span className="char-count">
              {fullName.length}/{NAME_MAX}
            </span>
            {errors.fullName && (
              <span className="form-error">{errors.fullName}</span>
            )}
          </div>

          <div className="form-group-dashboard">
            <label htmlFor="service">Select Service *</label>
            <select
              id="service"
              required
              value={selectedService}
              className={errors.service ? "input-error" : ""}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">-- Choose a service --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (≈ {s.waitTime} min)
                </option>
              ))}
            </select>
            {errors.service && (
              <span className="form-error">{errors.service}</span>
            )}
          </div>

          <div className="form-group-dashboard">
            <label htmlFor="reason">Reason for Visit</label>
            <textarea
              id="reason"
              maxLength={REASON_MAX}
              rows={3}
              placeholder="Brief reason (optional)"
              value={reason}
              className={errors.reason ? "input-error" : ""}
              onChange={(e) => setReason(e.target.value)}
              style={{ resize: "vertical" }}
            />
            <span
              className={`char-count${reason.length > REASON_MAX ? " over-limit" : ""}`}
            >
              {reason.length}/{REASON_MAX}
            </span>
            {errors.reason && (
              <span className="form-error">{errors.reason}</span>
            )}
          </div>

          <button type="submit" className="primary-btn">
            Join Queue
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinQueue;
