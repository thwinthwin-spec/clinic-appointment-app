import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/formatters';

export default function NotFoundPage() {
  const { user, token } = useAuth();

  let home = '/login';
  if (token && user) {
    home = isAdmin(user) ? '/admin' : '/doctors';
  }

  return (
    <div className="container not-found">
      <div className="not-found__code" aria-hidden="true">404</div>
      <h1>We couldn’t find that page</h1>
      <p>The link may be outdated, or the page may have moved.</p>
      <Link to={home} className="btn btn-primary">Go to the right place</Link>
    </div>
  );
}
