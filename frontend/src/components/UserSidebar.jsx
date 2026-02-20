import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { NavLink, Outlet } from "react-router-dom";
import "./UserSidebar.css";

function UserSidebar() {
  return (
    <div className="sidebar-layout">
      <Sidebar>
        <div className="sidebar-main">
          <div className="sidebar-menu-container">
            <Menu>
              <MenuItem component={<NavLink to="/user/dashboard" />}>Dashboard</MenuItem>
              <MenuItem component={<NavLink to="/user/join" />}>Join Queue</MenuItem>
              <MenuItem component={<NavLink to="/user/status" />}>Queue Status</MenuItem>
              <MenuItem component={<NavLink to="/user/history" />}>History</MenuItem>
              <MenuItem component={<NavLink to="/user/feedback" />}>Feedback</MenuItem>
            </Menu>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-avatar" />
            <div className="sidebar-user">User</div>
            <NavLink to="/" className="sidebar-logout">Logout</NavLink>
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
