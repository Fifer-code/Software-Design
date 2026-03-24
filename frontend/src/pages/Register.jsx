import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

const NAME_MAX = 50;
const EMAIL_MAX = 100;
const PASSWORD_MAX = 128;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (firstName.length > NAME_MAX) {
      newErrors.firstName = `First name cannot exceed ${NAME_MAX} characters`;
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (lastName.length > NAME_MAX) {
      newErrors.lastName = `Last name cannot exceed ${NAME_MAX} characters`;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        password,
      });

      navigate("/");
    } catch (error) {
      setSubmitError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="login-container">
        <h1>QueueSmart</h1>
        <p>Create your account</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-first-name">First Name</label>
            <input
              id="reg-first-name"
              type="text"
              maxLength={NAME_MAX}
              required
              placeholder="Your first name"
              value={firstName}
              className={errors.firstName ? "input-error" : ""}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.firstName && (
              <span className="error">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-last-name">Last Name</label>
            <input
              id="reg-last-name"
              type="text"
              maxLength={NAME_MAX}
              required
              placeholder="Your last name"
              value={lastName}
              className={errors.lastName ? "input-error" : ""}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </div>

          {submitError && <span className="error">{submitError}</span>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <Link to="/" className="register-link">
            Already have an account? Log in.
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Register;
