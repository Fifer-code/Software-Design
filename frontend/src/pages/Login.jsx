import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

const EMAIL_MAX = 100;
const PASSWORD_MAX = 128;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [errors, setErrors] = useState({});

  // Validate email and password before submission
  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (email.length > EMAIL_MAX) {
      newErrors.email = `Email cannot exceed ${EMAIL_MAX} characters`;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (password.length > PASSWORD_MAX) {
      newErrors.password = `Password cannot exceed ${PASSWORD_MAX} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Mock login
    localStorage.setItem("role", role);

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  return (
    <div className="auth-shell">
      <div className="login-container">
        <h1>QueueSmart</h1>
        <p>Smart Queue Management</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              maxLength={EMAIL_MAX}
              required
              placeholder="you@example.com"
              value={email}
              className={errors.email ? "input-error" : ""}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              maxLength={PASSWORD_MAX}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              value={password}
              className={errors.password ? "input-error" : ""}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {/* Role selector for testing. Could be removed in the future and done in backend. */}
          <div className="form-group">
            <label htmlFor="login-role">Login as</label>
            <select id="login-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit">Login</button>

          <Link to="/register" className="register-link">
            Don't have an account? Register here.
          </Link>

        </form>
      </div>
    </div>
  );
}

export default Login;
