import "./QueueManagement.css";
import AdminSidebar from "../../components/AdminSidebar";
import { useContext, useEffect, useState } from "react";
import { QueueContext } from "../../context/QueueContext";
import { getAuthHeaders } from "../../utils/auth";
import personIcon from '../../assets/person.svg';
import { useNotifications } from '../../context/NotificationContext';

// modular reusable user row with buttons and name
const QueueUserItem = ({ user, serviceId, onMove, onRemove, onOverridePriority }) => {
    const [overridePriority, setOverridePriority] = useState(user.priority || 'Low');

    // keep dropdown in sync if priority changes externally (e.g. after fetchQueueData)
    useEffect(() => {
        setOverridePriority(user.priority || 'Low');
    }, [user.priority]);

    return (
        <div className="queue-user">
            <div className="queue-user-info">
                <p>{user.name}</p>
                {user.subCategory && <span className="queue-subcategory">{user.subCategory}</span>}
                <span className={`queue-chip queue-chip-priority-${(user.priority || 'low').toLowerCase()}`}>
                    {user.priority || 'Low'}
                </span>
            </div>
            <div className="queue-user-actions">
                <button
                    className="queue-move-buttons"
                    onClick={() => onMove(serviceId, user.ticketId, 'up')}>
                    Move up
                </button>
                <button
                    className="queue-move-buttons"
                    onClick={() => onMove(serviceId, user.ticketId, 'down')}>
                    Move Down
                </button>
                <button
                    className="queue-move-buttons"
                    onClick={() => onRemove(serviceId, user.ticketId)}>
                    Remove
                </button>
                <select
                    value={overridePriority}
                    onChange={(e) => setOverridePriority(e.target.value)}
                    className="queue-move-buttons"
                >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <button
                    className="queue-move-buttons"
                    onClick={() => onOverridePriority(serviceId, user.ticketId, overridePriority)}>
                    Set Priority
                </button>
            </div>
        </div>
    );
};

// modular reusable for entire service card, uses backend configs
const QueueCard = ({ serviceId, title, description, status, usersList, estimatedWait, priority, onServe, onMove, onRemove, onOverridePriority }) => {
    return (
        <div className="admin-subcard">
            <h3>{title}</h3>
            {description && <p>{description}</p>}
            <div className="queue-description">
                <p style={{flex: 1}}>People in Queue: {usersList?.length || 0}</p>
                <p style={{flex: 1}}>Estimated Wait: {estimatedWait} minutes</p>
                <p style={{flex: 1}}>Priority: {priority}</p>
                <p style={{flex: 1}}>Status: {status}</p>
                <button type="submit" className="serve-button" onClick={() => onServe(serviceId)}>
                    Serve Next User
                </button>
            </div>

            <div className="queue-list-container">
                {usersList?.map((user) => (
                    <QueueUserItem
                        key={user.ticketId}
                        user={user}
                        serviceId={serviceId}
                        onMove={onMove}
                        onRemove={onRemove}
                        onOverridePriority={onOverridePriority}
                    />
                ))}
            </div>
        </div>
    );
};

function QueueManagement() {
    const { waitTimes, queueLists, queueStatuses, services, fetchQueueData } = useContext(QueueContext);
    const { addNotification } = useNotifications();

    useEffect(() => {
        fetchQueueData();
    }, []);

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


    // logic for for moving users pressing either move up or down button
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

    // override a single user's priority
    const handleOverridePriority = async (serviceId, ticketId, priority) => {
        try {
            const response = await fetch(`http://localhost:8080/api/queues/${serviceId}/${ticketId}/priority`, {
                method: 'PATCH',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ priority })
            });
            if (response.ok) {
                const data = await response.json();
                addNotification(data.message, "info");
                fetchQueueData();
            } else {
                addNotification("Failed to override priority", "warning");
            }
        } catch (error) {
            addNotification("Error overriding priority", "warning");
            console.error("Error overriding priority:", error);
        }
    };

    // logic for removing users when pressing remove button
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


    const [expandedService, setExpandedService] = useState(null);

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
                        <div className="queue-col queue-col-service">Service</div>
                        <div className="queue-col">People in Queue</div>
                        <div className="queue-col">Estimated Wait</div>
                        <div className="queue-col">Priority</div>
                        <div className="queue-col">Status</div>
                        <div className="queue-col queue-col-action">Action</div>
                    </div>

                    <div className="queue-table-body">
                        {services.map((service) => {
                            const users = queueLists?.[service.id] || [];
                            const people = users.length;
                            const wait = waitTimes?.[service.id]?.totalEstimatedWaitMinutes || 0;
                            const priority = service.priority || "Low";
                            const status = queueStatuses?.[service.id] || "open";
                            const isExpanded = expandedService === service.id;

                            return (
                                <div key={service.id}>
                                    <div className="queue-row" role="row">
                                        <div className="queue-col queue-col-service">
                                            <div className="queue-service-name">{service.name || "Unnamed Queue"}</div>
                                            {service.description && (
                                                <div className="queue-service-desc">{service.description}</div>
                                            )}
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
                                        <div className="queue-col queue-col-action">
                                            <button
                                                type="button"
                                                className="serve-button"
                                                onClick={() => handleServeNext(service.id)}
                                                disabled={people === 0}
                                            >
                                                Serve Next User
                                            </button>
                                            <button
                                                type="button"
                                                className="serve-button"
                                                style={{ marginTop: '4px' }}
                                                onClick={() => setExpandedService(isExpanded ? null : service.id)}
                                                disabled={people === 0}
                                            >
                                                {isExpanded ? "Hide Queue" : "Manage Queue"}
                                            </button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="queue-list-container">
                                            {users.map((user) => (
                                                <QueueUserItem
                                                    key={user.ticketId}
                                                    user={user}
                                                    serviceId={service.id}
                                                    onMove={handleMove}
                                                    onRemove={handleRemove}
                                                    onOverridePriority={handleOverridePriority}
                                                />
                                            ))}
                                        </div>
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
