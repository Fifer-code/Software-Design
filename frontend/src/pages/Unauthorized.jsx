import { Link } from 'react-router-dom';
import { getAuthRole } from '../utils/auth';
import './auth.css';

function Unauthorized() {
  const role = getAuthRole();
  const homePath = role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <div className="auth-shell">
      <div className="login-container">
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <Link to={homePath} className="register-link">
          Go back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;