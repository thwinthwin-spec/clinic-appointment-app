import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { DEMO_ACCOUNTS } from '../utils/constants';
import { isAdmin } from '../utils/formatters';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  let notice = '';
  let fromPath = '';
  if (location.state) {
    notice = location.state.message || '';
    if (location.state.from) fromPath = location.state.from.pathname;
  }

  // Check the two fields before calling the API.
  function validate() {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const session = await login({ email: email.trim(), password: password });

      let destination = '/doctors';
      if (isAdmin(session.user)) destination = '/admin';
      if (fromPath && !fromPath.startsWith('/login') && !fromPath.startsWith('/register')) {
        destination = fromPath;
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    setEmailError('');
    setPasswordError('');
    setServerError('');
  }

  return (
    <div className="container auth-layout">
      <section className="auth-hero">
        <h1>Book care that fits your day.</h1>
        <p>
          A simple sample clinic booking experience: find a doctor, pick an open slot,
          and keep all of your visits in one place.
        </p>
        <ul className="auth-benefits">
          <li><span aria-hidden="true">✓</span> Browse doctors by name or specialty</li>
          <li><span aria-hidden="true">✓</span> See live sample availability</li>
          <li><span aria-hidden="true">✓</span> Reschedule or cancel in a click</li>
        </ul>
      </section>

      <section className="card auth-card">
        <h2>Welcome back</h2>
        <p className="auth-card__subtitle">Sign in to manage your clinic appointments.</p>

        {notice && <div className="alert alert--success">{notice}</div>}
        <ErrorMessage message={serverError} title="Sign in failed" />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError('');
                  setServerError('');
                }}
                aria-invalid={Boolean(emailError)}
                disabled={submitting}
                required
              />
              {emailError && <span className="inline-error">{emailError}</span>}
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setPasswordError('');
                  setServerError('');
                }}
                aria-invalid={Boolean(passwordError)}
                disabled={submitting}
                required
              />
              {passwordError && <span className="inline-error">{passwordError}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="demo-panel">
          <div className="demo-panel__title">Sample logins (demo only)</div>
          {DEMO_ACCOUNTS.map((account) => (
            <div className="demo-account" key={account.email}>
              <span>
                <strong>{account.label}</strong><br />
                <code>{account.email} / {account.password}</code>
              </span>
              <button type="button" onClick={() => fillDemo(account)} disabled={submitting}>
                Use
              </button>
            </div>
          ))}
        </div>

        <div className="auth-footer">
          New to Clinic Care? <Link to="/register">Create an account</Link>
        </div>
      </section>
    </div>
  );
}
