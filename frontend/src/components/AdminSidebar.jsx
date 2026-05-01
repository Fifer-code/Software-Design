import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { NavLink, Outlet } from "react-router-dom";
import "./UserSidebar.css";
import { clearAuthSession } from "../utils/auth";

function AdminSidebar() {
  const handleLogout = () => {
    clearAuthSession();
  };

  return (
    <div className="sidebar-layout">
      <Sidebar>
        <div className="sidebar-main">
          <div className="sidebar-header">
            <div className="sidebar-logo">A</div>
            <h2 className="sidebar-title">QueueSmart</h2>
          </div>

          <div className="sidebar-menu-container">
            <Menu>
              <MenuItem component={<NavLink to="/admin/dashboard" />}>Dashboard</MenuItem>
              <MenuItem component={<NavLink to="/admin/queuemanagement" />}>Queue Management</MenuItem>
              <MenuItem component={<NavLink to="/admin/servicemanagement" />}>Service Management</MenuItem>
              <MenuItem component={<NavLink to="/admin/reports" />}>Reports</MenuItem>
              <MenuItem component={<NavLink to="/admin/feedback" />}>Feedback</MenuItem>
            </Menu>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-avatar" />
            <div className="sidebar-user">Admin</div>
            <NavLink to="/" className="sidebar-logout" onClick={handleLogout}>Logout</NavLink>
          </div>
        </div>
      </Sidebar>

      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminSidebar;