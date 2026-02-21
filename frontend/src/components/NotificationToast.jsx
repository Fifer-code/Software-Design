import { useNotifications } from "../context/NotificationContext";
import "/src/userdashboard.css";

function NotificationToast() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map((n) => (
        <div key={n.id} className={`toast toast-${n.type}`}>
          <span className="toast-icon">
            {n.type === "success" && "✓"}
            {n.type === "info" && "ℹ"}
            {n.type === "warning" && "⚠"}
          </span>
          <span className="toast-message">{n.message}</span>
          <button
            className="toast-close"
            onClick={() => removeNotification(n.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;
