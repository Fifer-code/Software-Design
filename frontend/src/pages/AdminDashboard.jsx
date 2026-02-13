import "./AdminDashboard.css"
import AdminHeader from "../components/AdminHeader.jsx"

function AdminDashboard() {
  return (
    <>
    <AdminHeader />
    <div className = "admin-shell">
        <div className = "admin-card-1">
            <h1>List of Services</h1>
            <a>service 1</a><br></br><br></br>
            <a>service 2</a><br></br><br></br>
            <a>service 3</a><br></br>
        </div>
        <div className = "admin-card-2">
            <h1>Current queue lengths</h1>
            <p>queue 1</p>
            <p>queue 2</p>
            <p>queue 3</p>
        </div>
        <div className = "admin-card-3">
            <h1>Quick actions (open/close queue)</h1>
            <p>action 1</p>
            <p>action 2</p>
            <p>action 3</p>
        </div>
    </div>
    </>
  );
}

export default AdminDashboard;
