import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css"
// backend connections
import { useContext, useEffect } from 'react';
import { QueueContext } from '../../context/QueueContext';

// modular card for service with configs from backend
const DashboardCard = ({ title, peopleCount, estimatedWait, priority }) => (
    <div className="admin-subcard">
        <h3>{title}</h3>
        <p>People in Queue: {peopleCount}</p>
        <p>Estimated Wait: {estimatedWait} minutes</p>
        <p>Priority: {priority}</p>
    </div>
);

function AdminDashboard() {
    // backend connection functions
    const { waitTimes, queueLists, services, fetchQueueData } = useContext(QueueContext);

    useEffect(() => {
        fetchQueueData();
    }, []);

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
        <div>
            <AdminSidebar></AdminSidebar>
        </div>
    <div className = "admin-shell">
        <h2>Admin Dashboard</h2>
        <div className = "admin-card-container">
            <div className = "admin-card-1">
                <h1>List of Services</h1>
                <div className = "admin-subcard">
                    <h3>DMV</h3>
                </div>
                <div className = "admin-subcard">
                    <h3>Banking</h3>
                </div>
                <div className = "admin-subcard">
                    <h3>Student Advising</h3>
                </div>
                <div className = "admin-subcard">
                    <h3>placeholder</h3>
                </div>
            </div>
            <div className="admin-card-2">
                <h1>Current Queue & Lengths</h1>
                {/* creates new cards depending on how many there are */}
                {services.map((service) => (
                    <DashboardCard 
                        key={service.id}
                        title={service.name || "Unnamed Queue"} 
                        peopleCount={queueLists?.[service.id]?.length || 0} 
                        estimatedWait={waitTimes?.[service.id] || 0} 
                        priority={service.priority || "Low"} 
                    />
                ))}
            </div>
            <div className = "admin-card-3">
                <h1>Quick Actions</h1>
                <div className = "admin-subcard form-group">
                    <p>Select Queue to Pause</p>
                    <select defaultValue="" required>
                        <option value="" disabled hidden></option>
                        <option value = "DMV 1">DMV Queue 1</option>
                        <option value = "Banking 1">Banking Queue 1</option>
                        <option value = "Advising 1">Student Advising Queue 1</option>
                        <option value = "placeholder">placeholder</option>
                    </select>
                </div>
                <div className = "admin-subcard form-group">
                    <p>Select Queue to Close</p>
                    <select defaultValue="" required>
                        <option value="" disabled hidden></option>
                        <option value = "DMV 1">DMV Queue 1</option>
                        <option value = "Banking 1">Banking Queue 1</option>
                        <option value = "Advising 1">Student Advising Queue 1</option>
                        <option value = "placeholder">placeholder</option>
                    </select>
                </div>
                <div className = "admin-subcard form-group">
                    <p>Select Queue to Open</p>
                    <select defaultValue="" required>
                        <option value="" disabled hidden></option>
                        <option value = "DMV 1">DMV Queue 1</option>
                        <option value = "Banking 1">Banking Queue 1</option>
                        <option value = "Advising 1">Student Advising Queue 1</option>
                        <option value = "placeholder">placeholder</option>
                    </select>
                </div>
                <div className = "admin-subcard-tall form-group">
                    <p>Send Notification</p>
                    <select defaultValue="" required>
                        <option value="" disabled hidden></option>
                        <option value = "DMV 1">DMV Queue 1</option>
                        <option value = "Banking 1">Banking Queue 1</option>
                        <option value = "Advising 1">Student Advising Queue 1</option>
                        <option value = "placeholder">placeholder</option>
                    </select>
                    <textarea rows = "7"></textarea>
                </div>
                <div className = "admin-subcard-short">
                    <p>Clear All Queues</p>
                </div>

            </div>
        </div>
    </div>
    </div>
  );
}

export default AdminDashboard;
