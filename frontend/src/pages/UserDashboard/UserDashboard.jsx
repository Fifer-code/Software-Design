import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import "/src/userdashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  // Get current queue from localStorage
  const currentQueue = JSON.parse(localStorage.getItem("currentQueue") || "null");

  return (
    <div className="page-container">
      <h2 className="page-title">User Dashboard</h2>

      <div className="card-grid">
        <div className="card">
          <h3>Current Queue</h3>
          {currentQueue ? (
            <>
              <p>Service: {currentQueue.service}</p>
              <p>Position: {currentQueue.position}</p>
              <p>Status: {currentQueue.status}</p>
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

        <div className="card">
          <h3>Active Services</h3>
          <p>DMV</p>
          <p>Banking</p>
          <p>Student Advising</p>
        </div>

        <div className="card">
          <h3>Notifications</h3>
          {notifications.length > 0 ? (
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
                      {n.timestamp.toLocaleTimeString([], {
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
      </div>
    </div>
  );
}

export default UserDashboard;