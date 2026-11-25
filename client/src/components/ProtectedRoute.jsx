import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin, isPatient } from '../utils/formatters';
import Loading from './Loading';

export default function ProtectedRoute({ children, role }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading fullPage label="Checking your session…" />;

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role === 'admin' && !isAdmin(user)) {
    return <Navigate to="/doctors" replace />;
  }

  if (role === 'patient' && !isPatient(user) && !isAdmin(user)) {
    return <Navigate to="/doctors" replace />;
  }

  return children;
}
