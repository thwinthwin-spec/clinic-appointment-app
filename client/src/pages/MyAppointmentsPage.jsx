import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import appointmentApi from '../api/appointmentApi';
import { getErrorMessage } from '../api/axios';
import AppointmentCard from '../components/AppointmentCard';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { APPOINTMENT_TABS } from '../utils/constants';
import { formatDate, formatTime } from '../utils/formatters';

export default function MyAppointmentsPage() {
  const location = useLocation();

  let initialNotice = '';
  if (location.state) initialNotice = location.state.message || '';

  const [scope, setScope] = useState('upcoming');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState(initialNotice);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // The server decides which visits are upcoming, past, or cancelled.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    appointmentApi
      .getMyAppointments(scope)
      .then((data) => {
        if (active) setItems(data.items);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [scope, refresh]);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelError('');
    setCancelBusy(true);
    try {
      await appointmentApi.cancelAppointment(cancelTarget._id, cancelReason.trim());
      setCancelTarget(null);
      setCancelReason('');
      setNotice('Appointment cancelled.');
      setRefresh(refresh + 1);
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleReschedule(id, updates) {
    await appointmentApi.rescheduleAppointment(id, updates);
    setNotice('Appointment rescheduled successfully.');
    setRefresh(refresh + 1);
  }

  function closeCancelModal() {
    if (cancelBusy) return;
    setCancelTarget(null);
    setCancelReason('');
    setCancelError('');
  }

  function handleTabClick(value) {
    setScope(value);
    setNotice('');
  }

  let content = null;
  if (loading) {
    content = <Loading label="Loading appointments…" />;
  } else if (!error) {
    if (items.length === 0) {
      let message = 'Nothing to show in this tab yet.';
      if (scope === 'upcoming') message = 'You have no upcoming visits. Find a doctor to book one.';
      content = (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">📅</span>
          <h3>No {scope} appointments</h3>
          <p>{message}</p>
          <Link to="/doctors" className="btn btn-primary btn-sm">Browse doctors</Link>
        </div>
      );
    } else {
      content = (
        <div className="grid appointment-list">
          {items.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onCancel={setCancelTarget}
              onReschedule={handleReschedule}
            />
          ))}
        </div>
      );
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My appointments</h1>
          <p className="page-subtitle">Review, reschedule, or cancel your sample visits.</p>
        </div>
        <Link to="/doctors" className="btn btn-primary">Book another visit</Link>
      </div>

      {notice && (
        <div className="alert alert--success">
          <span>{notice}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setNotice('')}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      <div className="tabs" role="tablist" aria-label="Appointment filters">
        {APPOINTMENT_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={scope === tab.value}
            className={'tab' + (scope === tab.value ? ' is-active' : '')}
            onClick={() => handleTabClick(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ErrorMessage
        message={error}
        title="Appointments could not be loaded"
        onRetry={() => setRefresh(refresh + 1)}
      />

      {content}

      {cancelTarget && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCancelModal();
          }}
        >
          <div className="modal modal--small" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title">
            <div className="modal__header">
              <h2 id="cancel-dialog-title">Cancel appointment?</h2>
              <button type="button" className="modal__close" onClick={closeCancelModal} aria-label="Close">×</button>
            </div>
            <div className="modal__body">
              <p>
                You are about to cancel your visit with{' '}
                <strong>{cancelTarget.doctor.name}</strong> on{' '}
                <strong>{formatDate(cancelTarget.date)}</strong> at{' '}
                <strong>{formatTime(cancelTarget.time)}</strong>.
              </p>
              <p className="text-muted text-small">This action cannot be undone.</p>
              <div className="field" style={{ marginTop: 16 }}>
                <label htmlFor="cancel-reason">Reason (optional)</label>
                <textarea
                  id="cancel-reason"
                  placeholder="Tell us why you are cancelling…"
                  value={cancelReason}
                  maxLength={300}
                  onChange={(event) => {
                    setCancelReason(event.target.value);
                    setCancelError('');
                  }}
                  disabled={cancelBusy}
                />
              </div>
              {cancelError && <p className="inline-error">{cancelError}</p>}
            </div>
            <div className="modal__footer">
              <button type="button" className="btn btn-outline" onClick={closeCancelModal} disabled={cancelBusy}>
                Keep appointment
              </button>
              <button type="button" className="btn btn-danger" onClick={handleCancel} disabled={cancelBusy}>
                {cancelBusy ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
