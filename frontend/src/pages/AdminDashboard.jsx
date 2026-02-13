import "./AdminDashboard.css"
import AdminHeader from "../components/AdminHeader.jsx"

function AdminDashboard() {
  return (
    <>
    <AdminHeader />
    <div className = "admin-shell">
        <div className = "admin-card-1">
            List of services
        </div>
        <div className = "admin-card-2">
            Current queue lengths
        </div>
        <div className = "admin-card-3">
        Quick actions (open/close queue)
        </div>
    </div>
    </>
  );
}

export default AdminDashboard;
