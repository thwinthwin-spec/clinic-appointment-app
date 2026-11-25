import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import { useAuth } from './context/AuthContext';
import { isAdmin } from './utils/formatters';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorListPage from './pages/DoctorListPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';

// Admins start at /admin, patients start at the doctor list.
function homeFor(user) {
  if (isAdmin(user)) return '/admin';
  return '/doctors';
}

function HomeRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return <Loading fullPage label="Opening Clinic Care…" />;

  let destination = '/login';
  if (token && user) destination = homeFor(user);
  return <Navigate to={destination} replace />;
}

// Signed-in users do not need to see the sign-in or register pages.
function GuestOnly({ children }) {
  const { user, token, loading } = useAuth();
  if (loading) return <Loading fullPage label="Checking your session…" />;

  if (token && user) return <Navigate to={homeFor(user)} replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          <Route path="/doctors" element={<ProtectedRoute><DoctorListPage /></ProtectedRoute>} />
          <Route path="/doctors/:id" element={<ProtectedRoute><DoctorDetailPage /></ProtectedRoute>} />
          <Route path="/book/:doctorId" element={<ProtectedRoute><BookAppointmentPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><MyAppointmentsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><AdminDoctorsPage /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminAppointmentsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>© {new Date().getFullYear()} Clinic Care — sample booking demo.</span>
          <span>All records shown are fictional demo data.</span>
          <Link to="/login">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
