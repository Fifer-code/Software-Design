import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

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

        {/* USER LAYOUT ROUTE */}
        <Route path="/user" element={<UserSidebar />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="join" element={<JoinQueue />} />
          <Route path="status" element={<QueueStatus />} />
          <Route path="history" element={<History />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
