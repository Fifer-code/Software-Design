import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationToast from "./components/NotificationToast";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
    <NotificationProvider>
      <BrowserRouter>
        <NotificationToast />
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
          <Route path="/admin/servicemanagement" element={<ServiceManagement />} />
          <Route path="/admin/queuemanagement" element={<QueueManagement />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
