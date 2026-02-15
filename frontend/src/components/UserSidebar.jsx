import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, Outlet } from "react-router-dom";

function UserSidebar() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar>
        <Menu>
          <MenuItem component={<Link to="/user/dashboard" />}>Dashboard</MenuItem>
          <MenuItem component={<Link to="/user/join" />}>Join Queue</MenuItem>
          <MenuItem component={<Link to="/user/status" />}>Queue Status</MenuItem>
          <MenuItem component={<Link to="/user/history" />}>History</MenuItem>
          <MenuItem component={<Link to="/user/feedback" />}>Feedback</MenuItem>
        </Menu>
      </Sidebar>

      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default UserSidebar;
