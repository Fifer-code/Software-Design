import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css"
// backend connections
import { useContext } from 'react';
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
    const { waitTimes, queueLists, services } = useContext(QueueContext);

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
                    <h1>Current Queues & Lengths</h1>
                    {/* checks services by connecting to backend */}
                    {services ? (
                            <>
                                <DashboardCard 
                                    title = {services.dmv.name} 
                                    peopleCount = {queueLists.dmv?.length || 0} 
                                    estimatedWait = {waitTimes.dmv || 0} 
                                    priority = {services.dmv.priority} 
                                />
                                <DashboardCard 
                                    title = {services.bank.name} 
                                    peopleCount = {queueLists.bank?.length || 0} 
                                    estimatedWait = {waitTimes.bank || 0} 
                                    priority = {services.bank.priority} 
                                />
                                <DashboardCard 
                                    title = {services.advising.name} 
                                    peopleCount = {queueLists.advising?.length || 0} 
                                    estimatedWait = {waitTimes.advising || 0} 
                                    priority = {services.advising.priority} 
                                />
                                <DashboardCard 
                                    title = {services.placeholder.name} 
                                    peopleCount = {queueLists.placeholder?.length || 0} 
                                    estimatedWait = {waitTimes.placeholder || 0} 
                                    priority = {services.placeholder.priority} 
                                />
                            </>
                            
                        ) : (
                            <p>Loading services...</p>  
                        )}{/* shows placeholder if not connected to backend */}
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
