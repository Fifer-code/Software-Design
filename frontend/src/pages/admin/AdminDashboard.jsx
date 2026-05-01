import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css"
// backend connections
import { useContext, useEffect, useState } from 'react';
import { getAuthHeaders } from '../../utils/auth';
import { QueueContext } from '../../context/QueueContext';
import { useNotifications } from '../../context/NotificationContext';

// modular card for service with configs from backend
const DashboardCard = ({ title, description, peopleCount, estimatedWait, priority, status }) => (
    <div className="admin-subcard">
        <h3>{title}</h3>
        <p>{description}</p>
        <p>Status: {status || 'open'}</p>
        <p>People in Queue: {peopleCount}</p>
        <p>Estimated Wait: {estimatedWait} minutes</p>
        <p>Priority: {priority}</p>
    </div>
);

function AdminDashboard() {
    // backend connection functions
    const { waitTimes, queueLists, queueStatuses, services, fetchQueueData } = useContext(QueueContext);
    const { addNotification } = useNotifications();

    const [pauseServiceId, setPauseServiceId] = useState('');
    const [closeServiceId, setCloseServiceId] = useState('');
    const [openServiceId, setOpenServiceId] = useState('');
    const [notifyServiceId, setNotifyServiceId] = useState('');
    const [notifyMessage, setNotifyMessage] = useState('');

    useEffect(() => {
        fetchQueueData();
    }, []);

    const handlePauseUnpause = async () => {
        if (!pauseServiceId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/queues/${pauseServiceId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ action: 'toggle' })
            });
            const data = await res.json();
            addNotification(data.message, "info");
            fetchQueueData();
        } catch (err) {
            addNotification("Failed to pause/unpause queue", "warning");
            console.error("Pause/Unpause failed:", err);
        }
    };

    const handleClose = async () => {
        if (!closeServiceId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/queues/${closeServiceId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ action: 'close' })
            });
            const data = await res.json();
            addNotification(data.message, "info");
            fetchQueueData();
        } catch (err) {
            addNotification("Failed to close queue", "warning");
            console.error("Close failed:", err);
        }
    };

    const handleOpen = async () => {
        if (!openServiceId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/queues/${openServiceId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ action: 'open' })
            });
            const data = await res.json();
            addNotification(data.message, "info");
            fetchQueueData();
        } catch (err) {
            addNotification("Failed to open queue", "warning");
            console.error("Open failed:", err);
        }
    };

    const handleSendNotification = async () => {
        if (!notifyServiceId || !notifyMessage.trim()) return;
        try {
            const res = await fetch('http://localhost:8080/api/notifications/admin', {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ serviceId: notifyServiceId, message: notifyMessage })
            });
            const data = await res.json();
            console.log('[SEND NOTIFICATION]', data);
            addNotification(data.message, "success");
            setNotifyMessage('');
        } catch (err) {
            console.error("Send notification failed:", err);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Clear all queues? This cannot be undone.")) return;
        try {
            const res = await fetch('http://localhost:8080/api/queues/reset', {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            addNotification(data.message, "info");
            fetchQueueData();
        } catch (err) {
            addNotification("Failed to clear queues", "warning");
            console.error("Clear all failed:", err);
        }
    };

    if (!services || !queueLists || !waitTimes) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-shell"><h2>Loading data...</h2></div>
            </div>
        );
    }

  return (
    <div className = "admin-layout">
        <AdminSidebar></AdminSidebar>
    <div className = "admin-shell">
        <h2>Admin Dashboard</h2>
        <div className = "admin-card-container">
            <div className = "admin-card-1">
                <h1>List of Services</h1>
                <div className="admin-subcard">
                    <h3>DMV</h3>
                    <p>Standard DMV services:</p>
                    <p>- License Renewal</p>
                    <p>- ID Registration</p>
                    <p>- Title Transfers</p>
                    <p>- Take Driver's Test</p>
                    <p>- Replace Lost Plates</p>
                </div>
                <div className="admin-subcard">
                    <h3>Banking</h3>
                    <p>Standard Teller services:</p>
                    <p>- Cash Deposits /  Withdrawals</p>
                    <p>- Open New Account</p>
                    <p>- Apply for a Loan</p>
                    <p>- Debit/Credit Card Replacement</p>
                </div>
                <div className="admin-subcard">
                    <h3>Student Advising</h3>
                    <p>Standard Advising services:</p>
                    <p>- Course Planning</p>
                    <p>- Drop or Add Classes</p>
                    <p>- Financial Aid Counseling</p>
                    <p>- Transcript Requests</p>
                </div>
            </div>
            <div className="admin-card-2">
                <h1>Current Queue & Lengths</h1>
                {/* creates new cards depending on how many there are */}
                {services.map((service) => (
                    <DashboardCard
                        key={service.id}
                        title={service.name || "Unnamed Queue"}
                        description={service.description || ""}
                        status={queueStatuses?.[service.id] || 'open'}
                        peopleCount={queueLists?.[service.id]?.length || 0}
                        estimatedWait={waitTimes?.[service.id] || 0}
                        priority={service.priority || "Low"}
                    />
                ))}
            </div>
            <div className = "admin-card-3">
                <h1>Quick Actions</h1>
                <div className = "admin-subcard form-group">
                    <p>Pause / Unpause Queue</p>
                    <select value={pauseServiceId} onChange={(e) => setPauseServiceId(e.target.value)}>
                        <option value="" disabled hidden></option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>
                    <button className="action-btn" onClick={handlePauseUnpause}>Pause / Unpause</button>
                </div>
                <div className = "admin-subcard form-group">
                    <p>Close Queue</p>
                    <select value={closeServiceId} onChange={(e) => setCloseServiceId(e.target.value)}>
                        <option value="" disabled hidden></option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>
                    <button className="action-btn" onClick={handleClose}>Close</button>
                </div>
                <div className = "admin-subcard form-group">
                    <p>Open Queue</p>
                    <select value={openServiceId} onChange={(e) => setOpenServiceId(e.target.value)}>
                        <option value="" disabled hidden></option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>
                    <button className="action-btn" onClick={handleOpen}>Open</button>
                </div>
                <div className = "admin-subcard-tall form-group">
                    <p>Send Notification</p>
                    <select value={notifyServiceId} onChange={(e) => setNotifyServiceId(e.target.value)}>
                        <option value="" disabled hidden></option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>
                    <textarea rows="4" value={notifyMessage} onChange={(e) => setNotifyMessage(e.target.value)}></textarea>
                    <button className="action-btn" onClick={handleSendNotification}>Send</button>
                </div>
                <div className = "admin-subcard-short">
                    <button className="action-btn" onClick={handleClearAll}>Clear All Queues</button>
                </div>
            </div>
        </div>
    </div>
    </div>
  );
}

export default AdminDashboard;
