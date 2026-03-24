import "./QueueManagement.css"
import AdminSidebar from "../../components/AdminSidebar";
// backend connections
import { useContext } from 'react';
import { QueueContext } from '../../context/QueueContext';

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
    const { waitTimes, queueLists, fetchQueueData } = useContext(QueueContext);

    // logic for serving next user in queue using button
    const handleServeNext = async (serviceId) => {
        const response = await fetch(`http://localhost:8080/api/queue/${serviceId}/serve`, { method: 'POST' });
        if (response.ok){
            fetchQueueData();
        }
    };

    // logic for for moving users pressing either move up or down button
    const handleMove = async (serviceId, ticketId, direction) => {
        const response = await fetch(`http://localhost:8080/api/queue/${serviceId}/${ticketId}/move`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ direction })
        });
        if (response.ok){
            fetchQueueData();
        }
    };

    // logic for removing users when pressing remove button
    const handleRemove = async (serviceId, ticketId) => {
        const response = await fetch(`http://localhost:8080/api/queue/${serviceId}/${ticketId}`, {
            method: 'DELETE'
        });
        if (response.ok){
            fetchQueueData();
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-shell">
                <h2>Queue Management</h2>
                <div className="admin-card-container">
                    <div className="admin-card-1">
                        <h1>Available Queues & Information</h1>
                        <div className="queue-grid-container">
                            <QueueCard 
                                serviceId="dmv"
                                title="DMV Queue 1" 
                                usersList={queueLists.dmv} 
                                estimatedWait={waitTimes?.dmv || 0} 
                                priority="Low"
                                onServe={handleServeNext}
                                onMove={handleMove} 
                                onRemove={handleRemove}
                            />

                            <QueueCard 
                                serviceId="bank"
                                title="Banking Queue 1" 
                                usersList={queueLists.bank}
                                estimatedWait={waitTimes?.bank || 0} 
                                priority="Medium"
                                onServe={handleServeNext}
                                onMove={handleMove} 
                                onRemove={handleRemove}
                            />

                            <QueueCard 
                                serviceId="advising"
                                title="Student Advising Queue 1" 
                                usersList={queueLists.advising} 
                                estimatedWait={waitTimes?.advising || 0} 
                                priority="High"
                                onServe={handleServeNext}
                                onMove={handleMove} 
                                onRemove={handleRemove}
                            />

                            <QueueCard 
                                serviceId="placeholder"
                                title="Placeholder" 
                                usersList={queueLists.placeholder} 
                                estimatedWait={waitTimes?.placeholder || 0} 
                                priority="Low"
                                onServe={handleServeNext}
                                onMove={handleMove} 
                                onRemove={handleRemove}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QueueManagement;