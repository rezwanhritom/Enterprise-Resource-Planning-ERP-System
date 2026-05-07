import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAllowedRole = user?.roles?.some((role) => allowedRoles.includes(role));
  if (!hasAllowedRole) {
    return <Navigate to="/attendance" replace />;
  }

  return children;
}
