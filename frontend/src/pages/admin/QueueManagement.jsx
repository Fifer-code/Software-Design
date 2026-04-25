import "./QueueManagement.css"
import AdminSidebar from "../../components/AdminSidebar";
// backend connections
import { useContext, useEffect } from 'react';
import { QueueContext } from '../../context/QueueContext';
import { getAuthHeaders } from '../../utils/auth';

// modular reusable user row with buttons and name
const QueueUserItem = ({ user, serviceId, onMove, onRemove }) => (
    <div className="queue-user">
        <p>{user.name}</p>
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
        </div>
    </div>
);

// modular reusable for entire service card, uses backend configs
const QueueCard = ({ serviceId, title, usersList, estimatedWait, priority, onServe, onMove, onRemove }) => {
    return (
        <div className="admin-subcard">
            <h3>{title}</h3>
            <div className="queue-description">
                <p>People in Queue: {usersList?.length || 0}</p> 
                <p>Estimated Wait: {estimatedWait} minutes</p>
                <p>Priority: {priority}</p>
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
                    />
                ))}
            </div>
        </div>
    );
};

function QueueManagement() {
    // backend connection functions
    const { waitTimes, queueLists, services, fetchQueueData } = useContext(QueueContext);

    useEffect(() => {
        fetchQueueData();
    }, []);

    // logic for serving next user in queue using button
    const handleServeNext = async (serviceId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/queues/${serviceId}/serve`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                fetchQueueData(); // Refresh the UI
            } else {
                console.error("Failed to serve next:", await response.text());
            }
        } catch (error) {
            console.error("Error serving next user:", error);
        }
    };

    // logic for for moving users pressing either move up or down button
    const handleMove = async (serviceId, ticketId, direction) => {
        try {
            // Fix 1: Must be a PATCH request to match queueRoutes.js
            const response = await fetch(`http://localhost:8080/api/queues/${serviceId}/${ticketId}/move`, {
                method: 'PATCH', 
                // Fix 2: Headers are required for req.body.direction to be parsed by express.json()
                headers: getAuthHeaders({
                    'Content-Type': 'application/json',
                }),
                // Fix 3: Send the direction ('up' or 'down') so the backend knows how to swap
                body: JSON.stringify({ direction }) 
            });
    
            if (response.ok) {
                // Fix 4: Force React to re-render the new order by re-fetching
                fetchQueueData(); 
            } else {
                console.error("Move failed:", await response.text());
            }
        } catch (error) {
            console.error("Error moving user:", error);
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
                fetchQueueData(); // Refresh the UI
            } else {
                console.error("Failed to remove:", await response.text());
            }
        } catch (error) {
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
                <div className="admin-card-container">
                    <div className="admin-card-1">
                            <h1>Available Queues & Information</h1>
                            {/* creates new cards depending on how many there are */}
                            {services.map((service) => (
                                <QueueCard 
                                    key={service.id}
                                    serviceId={service.id}
                                    title={service.name} 
                                    usersList={queueLists?.[service.id] || []} 
                                    estimatedWait={waitTimes?.[service.id] || 0} 
                                    priority={service.priority || "Low"}
                                    onServe={handleServeNext}
                                    onMove={handleMove} 
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                </div>
            </div>
        </div>
    );
}

export default QueueManagement;