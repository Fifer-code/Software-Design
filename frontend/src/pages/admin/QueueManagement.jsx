import "./QueueManagement.css";
import AdminSidebar from "../../components/AdminSidebar";
import { useContext, useEffect, useState } from "react";
import { QueueContext } from "../../context/QueueContext";
import { getAuthHeaders } from "../../utils/auth";
import personIcon from '../../assets/person.svg';
import { useNotifications } from '../../context/NotificationContext';

const QueueUserItem = ({ user, serviceId, onMove, onRemove }) => (
    <div className="queue-user">
        <div className="queue-user-position">{user.position}</div>
        <p className="queue-user-name">{user.name}</p>
        <div className="queue-user-service">{user.serviceName || user.serviceId || "Unknown Service"}</div>
        <span className={`queue-chip queue-chip-priority-${(user.priority || 'Low').toLowerCase()}`}>
            {user.priority || 'Low'}
        </span>
        <div className="queue-user-actions">
            <button
                className="queue-move-buttons"
                onClick={() => onMove(serviceId, user.ticketId, 'up')}
            >
                Move up
            </button>
            <button
                className="queue-move-buttons"
                onClick={() => onMove(serviceId, user.ticketId, 'down')}
            >
                Move Down
            </button>
            <button
                className="queue-move-buttons"
                onClick={() => onRemove(serviceId, user.ticketId)}
            >
                Remove
            </button>
        </div>
    </div>
);

const QueueManagePanel = ({ serviceId, usersList, onMove, onRemove }) => (
    <div className="queue-manage-panel">
        <div className="queue-manage-panel-header">
            <span>Queue Position</span>
            <span>Name</span>
            <span>Service</span>
            <span>Priority</span>
            <span className="queue-manage-panel-actions-label">Actions</span>
        </div>
        <div className="queue-list-container">
            {usersList.length > 0 ? (
                usersList.map((user) => (
                    <QueueUserItem
                        key={user.ticketId}
                        user={user}
                        serviceId={serviceId}
                        onMove={onMove}
                        onRemove={onRemove}
                    />
                ))
            ) : (
                <div className="queue-empty-state">No one is currently waiting in this queue.</div>
            )}
        </div>
    </div>
);

function QueueManagement() {
    const { waitTimes, queueLists, queueStatuses, services, fetchQueueData } = useContext(QueueContext);
    const { addNotification } = useNotifications();
    const [expandedQueueId, setExpandedQueueId] = useState(null);

    useEffect(() => {
        fetchQueueData();
    }, [fetchQueueData]);

    const handleServeNext = async (serviceId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/queues/${serviceId}/serve`, {
                method: "POST",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                addNotification(data.message, "success");
                fetchQueueData();
            } else {
                addNotification("Failed to serve next user", "warning");
                console.error("Failed to serve next:", await response.text());
            }
        } catch (error) {
            addNotification("Error serving next user", "warning");
            console.error("Error serving next user:", error);
        }
    };

    const handleMove = async (serviceId, ticketId, direction) => {
        try {
            const response = await fetch(`http://localhost:8080/api/queues/${serviceId}/${ticketId}/move`, {
                method: 'PATCH',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({ direction })
            });

            if (response.ok) {
                const data = await response.json();
                addNotification(data.message, "info");
                fetchQueueData();
            } else {
                addNotification("Failed to move user", "warning");
                console.error("Move failed:", await response.text());
            }
        } catch (error) {
            addNotification("Error moving user", "warning");
            console.error("Error moving user:", error);
        }
    };

    const handleRemove = async (serviceId, ticketId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/queues/${serviceId}/${ticketId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                addNotification(data.message, "info");
                fetchQueueData();
            } else {
                addNotification("Failed to remove user", "warning");
                console.error("Failed to remove:", await response.text());
            }
        } catch (error) {
            addNotification("Error removing user", "warning");
            console.error("Error removing user:", error);
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
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-shell">
                <h2>Queue Management</h2>

                <div className="queue-table-shell">
                    <div className="queue-table-header" role="row">
                        <div className="queue-col queue-col-service">Queue</div>
                        <div className="queue-col">People in Queue</div>
                        <div className="queue-col">Estimated Wait</div>
                        <div className="queue-col">Next Priority</div>
                        <div className="queue-col">Status</div>
                        <div className="queue-col queue-col-action">Action</div>
                    </div>

                    <div className="queue-table-body">
                        {Array.from(new Set(services.map((service) => service.category || service.id))).map((queueKey) => {
                            const categoryServices = services.filter((service) => (service.category || service.id) === queueKey);
                            const usersList = [...(queueLists?.[queueKey] || [])].sort(
                                (left, right) => (left.position || 0) - (right.position || 0)
                            );
                            const people = usersList.length;
                            const wait = waitTimes?.[queueKey]?.totalEstimatedWaitMinutes || 0;
                            const priority = usersList[0]?.priority || "Low";
                            const status = queueStatuses?.[queueKey] || "open";
                            const isExpanded = expandedQueueId === queueKey;
                            const queueTitle = categoryServices[0]?.category || queueKey;

                            return (
                                <div key={queueKey} className="queue-service-block" role="rowgroup">
                                    <div className="queue-row" role="row">
                                        <div className="queue-col queue-col-service">
                                            <div className="queue-service-name">{queueTitle}</div>
                                            <div className="queue-service-desc">{categoryServices.map((service) => service.name).join(' • ')}</div>
                                        </div>
                                        <div className="queue-col queue-value"><img src={personIcon} alt="person" className="qm-person-icon"/> {people}</div>
                                        <div className="queue-col queue-value">{wait} min</div>
                                        <div className="queue-col queue-value">
                                            <span className={`queue-chip queue-chip-priority-${priority.toLowerCase()}`}>
                                                {priority}
                                            </span>
                                        </div>
                                        <div className="queue-col queue-value">
                                            <span className={`queue-chip queue-chip-status-${status.toLowerCase()}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="queue-col queue-col-action queue-action-group">
                                            <button
                                                type="button"
                                                className="serve-button"
                                                onClick={() => handleServeNext(queueKey)}
                                                disabled={people === 0}
                                            >
                                                Serve Next User
                                            </button>
                                            <button
                                                type="button"
                                                className="manage-button"
                                                onClick={() => setExpandedQueueId(isExpanded ? null : queueKey)}
                                                disabled={people === 0}
                                            >
                                                {isExpanded ? "Hide" : "Manage"}
                                            </button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <QueueManagePanel
                                            serviceId={queueKey}
                                            usersList={usersList}
                                            onMove={handleMove}
                                            onRemove={handleRemove}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QueueManagement;
