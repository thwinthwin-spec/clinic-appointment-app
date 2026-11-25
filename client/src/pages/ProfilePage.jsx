import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { capitalize } from '../utils/formatters';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  // Copy the signed-in user into the form when the page opens.
  useEffect(() => {
    let userName = '';
    let userEmail = '';
    let userPhone = '';
    if (user) {
      userName = user.name || '';
      userEmail = user.email || '';
      userPhone = user.phone || '';
    }
    setName(userName);
    setEmail(userEmail);
    setPhone(userPhone);
  }, [user]);

  function validate() {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPhoneError('');

    if (!name.trim()) {
      setNameError('Your name is required.');
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError('Please enter at least 2 characters.');
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

    return valid;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    setNotice('');
    if (!validate()) return;

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      setNotice('Your profile has been updated.');
    } catch (err) {
      setServerError(err.message || 'Your profile could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  let memberSince = null;
  if (user && user.createdAt) {
    memberSince = new Date(user.createdAt).toLocaleDateString();
  }

  return (
    <div className="container container--narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">My profile</h1>
          <p className="page-subtitle">Keep your sample contact details up to date.</p>
        </div>
      </div>

      {notice && <div className="alert alert--success">{notice}</div>}
      <ErrorMessage message={serverError} title="Update failed" />

      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <h2 className="section-title">Account details</h2>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError('');
                setNotice('');
              }}
              aria-invalid={Boolean(nameError)}
              disabled={saving}
              required
            />
            {nameError && <span className="inline-error">{nameError}</span>}
          </div>

          <div className="field">
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError('');
                setNotice('');
              }}
              aria-invalid={Boolean(emailError)}
              disabled={saving}
              required
            />
            {emailError && <span className="inline-error">{emailError}</span>}
          </div>

          <div className="field">
            <label htmlFor="profile-phone">Phone</label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 010 1234"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setPhoneError('');
                setNotice('');
              }}
              aria-invalid={Boolean(phoneError)}
              disabled={saving}
            />
            {phoneError && <span className="inline-error">{phoneError}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="card">
        <h2 className="section-title">Account summary</h2>
        <dl className="detail-list">
          <div>
            <dt>Role</dt>
            <dd>{capitalize(user ? user.role : 'patient')}</dd>
          </div>
          <div>
            <dt>Account email</dt>
            <dd>{user ? user.email : '—'}</dd>
          </div>
          {memberSince && (
            <div>
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
            </div>
          )}
        </dl>
        <p className="text-muted text-small" style={{ marginTop: 14 }}>
          This demo contains fictional records only. Please do not enter real health information.
        </p>
      </div>
    </div>
  );
}
