// backend setup imports
import {useEffect} from "react";
import axios from "axios";

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

// backend queue connection
import { QueueProvider } from './context/QueueContext';

function App() {
    // backend setup connection
    const fetchAPI = async () => {
        const response = await axios.get("http://localhost:8080/api")
        console.log(response.data.fruits);
    };

    useEffect(() => {
        fetchAPI();
    }, []);

  return (
    <QueueProvider>
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
    </QueueProvider>
  );
}

export default App;
