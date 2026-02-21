import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import "/src/userdashboard.css";

function QueueStatus() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [queue, setQueue] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentQueue");
    if (stored) {
      setQueue(JSON.parse(stored));
    }
  }, []);

  // Simulate position updates every 15 seconds
  useEffect(() => {
    if (!queue || queue.position <= 1) return;

    const interval = setInterval(() => {
      setQueue((prev) => {
        if (!prev || prev.position <= 1) {
          clearInterval(interval);
          return prev;
        }
        const updated = { ...prev, position: prev.position - 1 };
        localStorage.setItem("currentQueue", JSON.stringify(updated));

        if (updated.position === 1) {
          addNotification("You're next in line! Please be ready.", "warning");
        } else {
          addNotification(
            `Queue update: You moved to position ${updated.position}.`,
            "info"
          );
        }

        return updated;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [queue?.position, addNotification]);

  const handleLeave = () => {
    const serviceName = queue?.service || "the queue";

    // Save to history
    const history = JSON.parse(localStorage.getItem("queueHistory") || "[]");
    history.unshift({
      service: queue.service,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      status: "Left Queue",
    });
    localStorage.setItem("queueHistory", JSON.stringify(history));

    localStorage.removeItem("currentQueue");
    setQueue(null);

    addNotification(`You left the ${serviceName} queue.`, "info");
  };

  if (!queue) {
    return (
      <div className="page-container">
        <h2 className="page-title">Queue Status</h2>
        <div className="card">
          <h3>No Active Queue</h3>
          <p>You are not currently in a queue.</p>
          <button
            className="secondary-btn"
            onClick={() => navigate("/user/join")}
          >
            Join a Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Queue Status</h2>

      <div className="card">
        <h3>{queue.service} Queue</h3>
        <p>Position: {queue.position}</p>
        <p>Estimated Wait: {queue.estimatedWait} minutes</p>
        <p>
          Status:{" "}
          {queue.position === 1 ? "You're next!" : queue.status}
        </p>
        <button className="secondary-btn" onClick={handleLeave}>
          Leave Queue
        </button>
      </div>
    </div>
  );
}

export default QueueStatus;
