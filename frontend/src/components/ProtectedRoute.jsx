import { Navigate, Outlet } from 'react-router-dom';
import { getAuthRole, getAuthToken, isAuthenticated } from '../utils/auth';

export function ProtectedRoute({ allowedRoles }) {
  if (!isAuthenticated() || !getAuthToken()) {
    return <Navigate to="/" replace />;
  }

  const role = getAuthRole();
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  if (!isAuthenticated()) {
    return <Outlet />;
  }

  const role = getAuthRole();
  const destination = role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  return <Navigate to={destination} replace />;
}