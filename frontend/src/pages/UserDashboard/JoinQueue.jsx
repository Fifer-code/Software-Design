import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import axios from "axios";
import "/src/userdashboard.css";
import { getAuthHeaders } from "../../utils/auth";

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
  const fetchData = async () => {
    try {
      const [servicesRes, queuesRes, waitTimesRes] = await Promise.all([
        axios.get("http://localhost:8080/api/services", { headers: getAuthHeaders() }),
        axios.get("http://localhost:8080/api/queues", { headers: getAuthHeaders() }),
        axios.get("http://localhost:8080/api/queues/wait-time", { headers: getAuthHeaders() })
      ]);

      const fetchedServices = servicesRes.data?.services || [];
      const queues = queuesRes.data?.queues || {};
      const waitTimes = waitTimesRes.data?.waitTimes || {};

      const servicesWithWaitTimes = Array.isArray(fetchedServices) ? fetchedServices.map(service => {
        
        const currentQueueLength = queues[service.id]?.length || 0;
        
        const perPersonWait = waitTimes[service.id]?.estimatedPerPersonMinutes ?? service.duration ?? 0;
        
        const estimatedWaitTime = Math.max(0, currentQueueLength * perPersonWait);

        return {
          ...service,
          waitTime: estimatedWaitTime
        };
      }) : [];

      setServices(servicesWithWaitTimes);
    } catch (err) {
      console.error("Failed to fetch data for wait times:", err);
      setServices([]);
    }
  };

  fetchData();
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
      },
      {
        headers: getAuthHeaders()
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
    const errorMsg = err.response?.data?.message || err.message || "Failed to join queue";
    console.log("Join error details:", err.response?.data);
    addNotification(errorMsg, "error");
  }
};


const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="page-container">
      <h2 className="page-title">Join a Queue</h2>
      <div className="join-layout">
        <div className="join-left">
          <div className="join-table-shell">
            <div className="join-table-header" role="row">
              <div className="join-col join-col-service">Service</div>
              <div className="join-col">Estimated Wait</div>
            </div>

            <div className="join-table-body">
              {services.map((service) => (
                <div key={service.id} className="join-row" role="row">
                  <div className="join-col join-col-service">
                    <div className="join-service-name">{service.name}</div>
                    {service.description && (
                      <div className="join-service-desc">{service.description}</div>
                    )}
                  </div>
                  <div className="join-col join-value">{service.waitTime} min</div>
                </div>
              ))}
            </div>
          </div>
        </div>
              
        <div className="join-right">
          <div className="card" style={{ marginTop: 0 }}>
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
            <label htmlFor="service">Select Service</label>
            <select
              id="service"
              required
              value={selectedService}
              className={errors.service ? "input-error" : ""}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">-- Choose a service --</option>
              
              {/* Map through the grouped services to create optgroups */}
              {Object.keys(groupedServices).map((category) => (
                <optgroup key={category} label={category}>
                  {groupedServices[category].map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (≈ {s.waitTime ?? "N/A"} min)
                    </option>
                  ))}
                </optgroup>
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
      </div>
    </div>
  );
}

export default JoinQueue;