import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";

/* admin routes */
import AdminDashboard from "./pages/admin/AdminDashboard";
import ServiceManagement from "./pages/admin/ServiceManagement";
import QueueManagement from "./pages/admin/QueueManagement";

/*user routes*/
import UserSidebar from "./components/UserSidebar";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import JoinQueue from "./pages/UserDashboard/JoinQueue";
import QueueStatus from "./pages/UserDashboard/QueueStatus";
import History from "./pages/UserDashboard/History";
import Feedback from "./pages/UserDashboard/Feedback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* user routes */}
        <Route path="/user" element={<UserSidebar />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="join" element={<JoinQueue />} />
          <Route path="status" element={<QueueStatus />} />
          <Route path="history" element={<History />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path = "/admin/servicemanagement" element = {<ServiceManagement />}/>
        <Route path = "/admin/queuemanagement" element = {<QueueManagement />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
