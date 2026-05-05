import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useState, useEffect } from "react";
import axios from "axios";
import "/src/userdashboard.css";
import { getAuthHeaders } from "../../utils/auth";

function UserDashboard() {
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  const [services, setServices] = useState([]);
  const [ticket, setTicket] = useState(null);


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/services", {
          headers: getAuthHeaders()
        });
        const arr = res.data?.services;
        setServices(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error("Services error:", err);
        setServices([]);
      }
    };

    fetchServices();
  }, []);


  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentTicket");
      if (!raw) {
        setTicket(null);
        return;
      }
      const parsed = JSON.parse(raw);
      setTicket(parsed);
    } catch (err) {
      console.error("Ticket load error:", err);
      setTicket(null);
    }
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-title">User Dashboard</h2>

      <div className="card-grid">
        {/* CURRENT QUEUE */}
        <div className="card current-queue-card">
          <h3>Current Queue</h3>

          {ticket ? (
            <>
              <p>Ticket ID: {ticket.ticketId || ticket.id}</p>
              <p>Status: {ticket.status || "Waiting"}</p>

              <button
                className="secondary-btn"
                onClick={() => navigate("/user/status")}
              >
                View Status
              </button>
            </>
          ) : (
            <>
              <p>You are not currently in a queue.</p>
              <button
                className="secondary-btn"
                onClick={() => navigate("/user/join")}
              >
                Join Queue
              </button>
            </>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="card notifications-card">
          <h3>Notifications</h3>

          {notifications && notifications.length > 0 ? (
            <ul className="notification-list">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="notification-item">
                  <span className="notif-icon">
                    {n.type === "success" && "✓"}
                    {n.type === "info" && "ℹ"}
                    {n.type === "warning" && "⚠"}
                  </span>
                  <div>
                    {n.message}
                    <span className="notif-time">
                      {new Date(n.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No new updates.</p>
          )}
        </div>

        {/* SERVICES */}
        <div className="card active-services-card">
          <h3>Active Services</h3>

          {services.length > 0 ? (
            <div className="ud-service-rows-wrap">
              {services.map((s) => (
                <div key={s.id || s.serviceId || s.name} className="ud-service-row">
                  <div className="ud-service-row-main">
                    <p className="ud-service-row-name">{s.name}</p>
                    <p className="ud-service-row-desc">{s.description || "No description available."}</p>
                  </div>
                  <div className="ud-service-row-meta">
                    <span>{s.duration ? `${s.duration} min` : "--"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No services available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
