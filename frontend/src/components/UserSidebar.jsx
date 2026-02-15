import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, Outlet } from "react-router-dom";
import "/src/userdashboard.css";

function UserSidebar() {
  return (
    <div className="sidebar-layout">
      <Sidebar>
        <div className="sidebar-main">
          <Menu>
            <MenuItem component={<Link to="/user/dashboard" />}>Dashboard</MenuItem>
            <MenuItem component={<Link to="/user/join" />}>Join Queue</MenuItem>
            <MenuItem component={<Link to="/user/status" />}>Queue Status</MenuItem>
            <MenuItem component={<Link to="/user/history" />}>History</MenuItem>
            <MenuItem component={<Link to="/user/feedback" />}>Feedback</MenuItem>
          </Menu>

          <div className="sidebar-footer">
            <div className="sidebar-avatar" />
            <div className="sidebar-user">User</div>
            <Link to="/" className="sidebar-logout">Logout</Link>
          </div>
        </div>
      </Sidebar>

      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
        </div>
    );
}

export default UserSidebar;
