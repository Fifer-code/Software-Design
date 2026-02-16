import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

const NAME_MAX = 50;
const EMAIL_MAX = 100;
const PASSWORD_MAX = 128;

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.length > NAME_MAX) {
      newErrors.name = `Name cannot exceed ${NAME_MAX} characters`;
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Mock register
    const existing = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    existing.push({ name, email, role: "user" });
    localStorage.setItem("mockUsers", JSON.stringify(existing));

    navigate("/");
  };

  return (
    <div className="auth-shell">
      <div className="login-container">
        <h1>QueueSmart</h1>
        <p>Create your account</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Name</label>
            <input
              id="reg-name"
              type="text"
              maxLength={NAME_MAX}
              required
              placeholder="Your full name"
              value={name}
              className={errors.name ? "input-error" : ""}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
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

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              maxLength={PASSWORD_MAX}
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              className={errors.confirmPassword ? "input-error" : ""}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit">Create Account</button>

          <Link to="/" className="register-link">
            Already have an account? Log in.
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Register;
