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
                    <p><a>DMV</a></p>
                </div>
                <div className = "admin-subcard">
                    <p><a>Banking</a></p>
                </div>
                <div className = "admin-subcard">
                    <p><a>Student Advising</a></p>
                </div>
                <div className = "admin-subcard">
                    <p><a>placeholder</a></p>
                </div>
            </div>
            <div className = "admin-card-2">
                <h1>Current queue lengths</h1>
                <div className = "admin-subcard">
                    <p><a>DMV Queue 1</a></p>
                </div>
                <div className = "admin-subcard">
                    <p><a>Banking Queue 1</a></p>
                </div>
                <div className = "admin-subcard">
                    <p><a>Student Advising Queue 1</a></p>
                </div>
                <div className = "admin-subcard">
                    <p><a>placeholder</a></p>
                </div>
            </div>
            <div className = "admin-card-3">
                <h1>Quick actions</h1>
                <div className = "admin-subcard">
                    <p>Select Queue to Pause</p>
                    <select className = "form-group">
                        <option></option>
                        <option></option>
                        <option></option>
                        <option></option>
                    </select>
                </div>
                <div className = "admin-subcard">
                    <p>Select Queue to Close</p>
                    <select>
                        <option></option>
                        <option></option>
                        <option></option>
                        <option></option>
                    </select>
                </div>
                <div className = "admin-subcard">
                    <p>Select Queue to Open</p>
                    <select>
                        <option></option>
                        <option></option>
                        <option></option>
                        <option></option>
                    </select>
                </div>
                <div className = "admin-subcard-tall">
                    <p>Send Notification</p>
                    <textarea rows = "7"></textarea>
                    <select>
                        <option></option>
                        <option></option>
                        <option></option>
                        <option></option>
                    </select>
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
