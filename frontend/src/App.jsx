import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ServiceManagement from "./pages/ServiceManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* If url is = path, render the specified element (ie. page/component). Need to add validation later. */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path = "/admin/servicemanagement" element = {<ServiceManagement />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
