import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { isAdmin } from '../utils/formatters';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmError('');

    if (!name.trim()) {
      setNameError('Your name is required.');
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError('Please enter your full name.');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    if (phone.trim() && !PHONE_PATTERN.test(phone.trim())) {
      setPhoneError('Enter a valid phone number or leave this blank.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      valid = false;
    } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setPasswordError('Include at least one letter and one number.');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmError('Passwords do not match.');
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    // Phone is optional, so only send it when the patient entered one.
    const details = {
      name: name.trim(),
      email: email.trim(),
      password: password,
    };
    if (phone.trim()) details.phone = phone.trim();

    setSubmitting(true);
    try {
      const session = await register(details);
      let destination = '/doctors';
      if (isAdmin(session.user)) destination = '/admin';
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container auth-layout">
      <section className="auth-hero">
        <h1>Create your sample account.</h1>
        <p>
          Register to explore the demo booking flow. All information in this app is
          fictional — do not enter real patient information.
        </p>
        <ul className="auth-benefits">
          <li><span aria-hidden="true">✓</span> Book with any sample doctor</li>
          <li><span aria-hidden="true">✓</span> Manage upcoming and past visits</li>
          <li><span aria-hidden="true">✓</span> Update your contact details</li>
        </ul>
      </section>

      <section className="card auth-card">
        <h2>Create account</h2>
        <p className="auth-card__subtitle">It only takes a moment.</p>

        <ErrorMessage message={serverError} title="Registration failed" />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Alex Morgan"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError('');
                  setServerError('');
                }}
                aria-invalid={Boolean(nameError)}
                disabled={submitting}
                required
              />
              {nameError && <span className="inline-error">{nameError}</span>}
            </div>

            <div className="field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
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
              <label htmlFor="register-phone">Phone (optional)</label>
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 555 010 1234"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setPhoneError('');
                  setServerError('');
                }}
                aria-invalid={Boolean(phoneError)}
                disabled={submitting}
              />
              {phoneError && <span className="inline-error">{phoneError}</span>}
            </div>

            <div className="form-grid form-grid--two">
              <div className="field">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
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

              <div className="field">
                <label htmlFor="register-confirm">Confirm password</label>
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setConfirmError('');
                    setServerError('');
                  }}
                  aria-invalid={Boolean(confirmError)}
                  disabled={submitting}
                  required
                />
                {confirmError && <span className="inline-error">{confirmError}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in instead</Link>
        </div>
      </section>
    </div>
  );
}
