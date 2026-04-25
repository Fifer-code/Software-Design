import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";
import { clearAuthSession, setAuthSession } from "../utils/auth";

const EMAIL_MAX = 100;
const PASSWORD_MAX = 128;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { role, token } = response.data;

      if (!token || !role) {
        throw new Error("Invalid authentication response");
      }

      setAuthSession({ token, role });

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      clearAuthSession();
      setSubmitError(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {submitError && <span className="error">{submitError}</span>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <Link to="/register" className="register-link">
            Don't have an account? Register here.
          </Link>

        </form>
      </div>
    </div>
  );
}

export default Login;
