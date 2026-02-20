import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link} from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  return (
    <>
      <Sidebar width="100%" className="admin-sidebar">
        <div className="sidebar-main">
          <Menu>
            <MenuItem component={<Link to="/admin/dashboard" />}>Dashboard</MenuItem>
            <MenuItem component={<Link to="/admin/queuemanagement" />}>Queue <br></br> Management</MenuItem>
            <MenuItem component={<Link to="/admin/servicemanagement" />}>Service <br></br> Management</MenuItem>
          </Menu>

          <div className="sidebar-footer">
            <div className="sidebar-avatar" />
            <div className="sidebar-user">Admin</div>
            <Link to="/" className="sidebar-logout">Logout</Link>
          </div>
        </div>
      </Sidebar>
    </>
    );
}

export default AdminSidebar;