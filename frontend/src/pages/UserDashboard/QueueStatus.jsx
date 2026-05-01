import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import axios from "axios";
import "/src/userdashboard.css";
import { getAuthHeaders } from "../../utils/auth";

function QueueStatus() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [ticket, setTicket] = useState(null);
  const [position, setPosition] = useState(null);
  const [queueLength, setQueueLength] = useState(0);

  // tracks which backend notification IDs have already been shown as toasts
  const seenNotifIds = useRef(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("currentTicket");
    if (stored) {
      setTicket(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!ticket) return;

    const fetchQueue = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/queues", {
          headers: getAuthHeaders()
        });
        const queues = res.data.queues || {};
        const serviceQueue = queues[ticket.serviceId] || [];

        const index = serviceQueue.findIndex(
          (u) => u.ticketId === ticket.ticketId
        );

        setPosition(index === -1 ? null : index + 1);
        setQueueLength(serviceQueue.length);

      } catch (err) {
        console.error(err);
      }
    };

    // poll backend notifications and show any unseen ones as toasts
    const fetchNotifications = async (ticketId) => {
      try {
        const res = await axios.get(`http://localhost:8080/api/notifications/${ticketId}`, {
          headers: getAuthHeaders()
        });
        const notifications = res.data.notifications || [];
        notifications.forEach((notif) => {
          if (!seenNotifIds.current.has(notif._id)) {
            seenNotifIds.current.add(notif._id);
            if (notif.type === "near_front") {
              addNotification(notif.message, "warning");
            } else if (notif.type === "joined") {
              addNotification(notif.message, "success");
            }
          }
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchQueue();
    fetchNotifications(ticket.ticketId);
    const interval = setInterval(() => {
      fetchQueue();
      fetchNotifications(ticket.ticketId);
    }, 5000);
    return () => clearInterval(interval);
  }, [ticket]);

  const handleLeave = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/queues/${ticket.serviceId}/${ticket.ticketId}`,
        {
          headers: getAuthHeaders()
        }
      );

      const historyItem = {
        date: new Date().toLocaleString(),
        service: ticket.serviceName || ticket.serviceId,
        status: "Left",
      };

      const prevHistory = JSON.parse(
        localStorage.getItem("queueHistory") || "[]"
      );
      const updatedHistory = Array.isArray(prevHistory)
        ? [...prevHistory, historyItem]
        : [historyItem];

      localStorage.setItem("queueHistory", JSON.stringify(updatedHistory));

      localStorage.removeItem("currentTicket");
      setTicket(null);

      addNotification(`You left the ${ticket.serviceId} queue.`, "info");
    } catch (err) {
      console.error(err);
      addNotification("Failed to leave queue", "error");
    }
  };

  if (!ticket) {
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


  const serviceIdLabel =
    typeof ticket?.serviceId === "string"
      ? ticket.serviceId.toUpperCase()
      : "Unknown";

  const estimatedWaitLabel =
    ticket?.estimatedWait != null ? ticket.estimatedWait : "N/A";

  const statusLabel =
    position === 1 ? "You're next!" : ticket?.status || "Unknown";

  return (
    <div className="page-container">
      <h2 className="page-title">Queue Status</h2>

      <div className="card">
        <h3>{serviceIdLabel} Queue</h3>
        <p>Position: {position ?? "N/A"}</p>
        <p>Estimated Wait: {estimatedWaitLabel} minutes</p>
        <p>Status: {statusLabel}</p>
        <button className="secondary-btn" onClick={handleLeave}>
          Leave Queue
        </button>
      </div>
    </div>
  );
}

export default QueueStatus;
