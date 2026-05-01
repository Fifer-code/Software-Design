import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css"
import personIcon from '../../assets/person.svg';
// backend connections
import { useContext, useEffect, useState } from 'react';
import { getAuthHeaders } from '../../utils/auth';
import { QueueContext } from '../../context/QueueContext';
import { useNotifications } from '../../context/NotificationContext';

function AdminDashboard() {
    // backend connection functions
    const { waitTimes, queueLists, queueStatuses, services, fetchQueueData } = useContext(QueueContext);
    const { addNotification } = useNotifications();

    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [notifyMessage, setNotifyMessage] = useState('');
    const [showNotifyBox, setShowNotifyBox] = useState(false);

    useEffect(() => {
        fetchQueueData();
    }, []);

    const handlePauseUnpause = async () => {
        if (!selectedServiceId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/queues/${selectedServiceId}/status`, {
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
        if (!selectedServiceId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/queues/${selectedServiceId}/status`, {
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
        if (!selectedServiceId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/queues/${selectedServiceId}/status`, {
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
        if (!selectedServiceId || !notifyMessage.trim()) return;
        try {
            const res = await fetch('http://localhost:8080/api/notifications/admin', {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ serviceId: selectedServiceId, message: notifyMessage })
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

    if (!services || !queueLists) {
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
        <div className="dashboard-header-row">
            <h2>Admin Dashboard</h2>
            <div className="global-quick-actions">
                <div className="global-qa-inner">
                    <div className="qa-label">Quick Actions</div>
                    <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="qa-select">
                        <option value="" disabled hidden>Select a queue</option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>
                    <div className="qa-buttons">
                        <button className="qa-btn" onClick={handlePauseUnpause}>Pause / Unpause</button>
                        <button className="qa-btn" onClick={handleClose}>Close</button>
                        <button className="qa-btn" onClick={handleOpen}>Open</button>
                        <button className="qa-btn" onClick={handleClearAll}>Clear All</button>
                        <button className="qa-btn" onClick={() => setShowNotifyBox((s) => !s)}>{showNotifyBox ? 'Hide Message' : 'Send Notification'}</button>
                    </div>
                </div>
            </div>
        </div>

        {showNotifyBox && (
            <div className="global-qa-collapse">
                <div className="global-qa-inner">
                    <textarea className="notify-textarea" rows={4} value={notifyMessage} onChange={(e) => setNotifyMessage(e.target.value)} placeholder="Message to selected queue" />
                    <button className="notify-send-btn" onClick={handleSendNotification}>Send</button>
                </div>
            </div>
        )}

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
                <div className="dash-queue-rows-shell">
                    {services.map((service) => {
                        const status = (queueStatuses?.[service.id] || 'open').toLowerCase();
                        const statusClass = ['open', 'paused', 'closed'].includes(status) ? status : 'default';
                        const people = queueLists?.[service.id]?.length || 0;

                        return (
                            <div className="dash-queue-row" key={service.id}>
                                <div className="dash-queue-row-main dash-queue-col-service">
                                    <p className="dash-queue-row-name">{service.name || "Unnamed Queue"}</p>
                                    <p className="dash-queue-row-detail">{service.description || "No details provided"}</p>
                                </div>

                                <div className="dash-queue-row-status dash-queue-col-status">
                                    <span className={`dash-queue-chip dash-queue-chip-status-${statusClass}`}>{status}</span>
                                </div>

                                <span className="dash-queue-people-count dash-queue-col-people"><img src={personIcon} alt="person" className="dash-person-icon"/> {people}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
        </div>
    </div>
    </div>
  );
}

export default AdminDashboard;
