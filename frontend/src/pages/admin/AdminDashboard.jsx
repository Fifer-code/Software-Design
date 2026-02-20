import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css"


function AdminDashboard() {
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
                    <p>DMV</p>
                </div>
                <div className = "admin-subcard">
                    <p>Banking</p>
                </div>
                <div className = "admin-subcard">
                    <p>Student Advising</p>
                </div>
                <div className = "admin-subcard">
                    <p>placeholder</p>
                </div>
            </div>
            <div className = "admin-card-2">
                <h1>Current Queues & Lengths</h1>
                <div className = "admin-subcard">
                    <h3>DMV Queue 1</h3>
                    <p>People in Queue: 18</p>
                    <p>Estimated Wait: 45 minutes</p>
                </div>
                <div className = "admin-subcard">
                    <h3>Banking Queue 1</h3>
                    <p>People in Queue: 7</p>
                    <p>Estimated Wait: 25 minutes</p>
                </div>
                <div className = "admin-subcard">
                    <h3>Student Advising Queue 1</h3>
                    <p>People in Queue: 4</p>
                    <p>Estimated Wait: 95 minutes</p>
                </div>
                <div className = "admin-subcard">
                    <h3>placeholder</h3>
                    <p>People in Queue: </p>
                    <p>Estimated Wait: </p>
                </div>
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
