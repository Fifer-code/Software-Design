import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import axios from "axios";
import "/src/userdashboard.css";

const NAME_MAX = 50;
const REASON_MAX = 150;

function JoinQueue() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [fullName, setFullName] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});


useEffect(() => {
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/services");
      const arr = res.data?.services;
      setServices(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error(err);
      setServices([]);
    }
  };

  fetchServices();
}, []);

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


  const handleJoin = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    const service = services.find((s) => String(s.id) === selectedService);

    if (!service) {
      addNotification("Invalid service selected", "error");
      return;
    }

    const res = await axios.post(
      `http://localhost:8080/api/queues/${service.id}/join`,
      {
        name: fullName.trim(),
        serviceId: service.id,
        priority: "Low",
      }
    );

    const ticket = res.data;


    localStorage.setItem("currentTicket", JSON.stringify(ticket));

    addNotification(
      `You joined the ${service.name} queue. Estimated wait: ${service.waitTime} min.`,
      "success"
    );


    navigate("/user/status");
  } catch (err) {
    console.error(err);
    console.log(err.response?.data);
    addNotification("Failed to join queue", "error");
  }
};


  return (
    <div className="page-container">
      <h2 className="page-title">Join a Queue</h2>

      <div className="card-grid">
        {services.map((service) => (
          <div className="card" key={service.id}>
            <h3>{service.name}</h3>
            <p>Estimated Wait: {service.waitTime ?? "N/A"} minutes</p>
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
                  {s.name} (≈ {s.waitTime ?? "N/A"} min)
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