import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { capitalize, getInitials, isAdmin } from '../utils/formatters';

function linkClass(state) {
  if (state.isActive) return 'nav-link is-active';
  return 'nav-link';
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const admin = isAdmin(user);

  let navLinks = null;
  if (isAuthenticated && admin) {
    navLinks = (
      <>
        <NavLink to="/admin" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/admin/doctors" className={linkClass}>Doctors</NavLink>
        <NavLink to="/admin/appointments" className={linkClass}>Appointments</NavLink>
        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
      </>
    );
  } else if (isAuthenticated) {
    navLinks = (
      <>
        <NavLink to="/doctors" end className={linkClass}>Find doctors</NavLink>
        <NavLink to="/appointments" className={linkClass}>My appointments</NavLink>
        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
      </>
    );
  } else {
    navLinks = (
      <>
        <NavLink to="/login" className={linkClass}>Sign in</NavLink>
        <NavLink to="/register" className={linkClass}>Register</NavLink>
      </>
    );
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  let accountArea = <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>;
  if (isAuthenticated) {
    const displayName = user.name || user.email || 'Account';
    accountArea = (
      <>
        <span className="avatar avatar--small" aria-hidden="true">
          {getInitials(displayName)}
        </span>
        <span className="header-account__name">
          <strong>{displayName}</strong>
          <small>{capitalize(user.role || 'member')}</small>
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Log out
        </button>
      </>
    );
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Clinic Care home">
          <span className="brand__mark" aria-hidden="true">✚</span>
          <span className="brand__text">Clinic<span>Care</span></span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          {navLinks}
        </nav>

        <div className="header-account">
          {accountArea}
        </div>
      </div>
    </header>
  );
}
