import { useEffect, useState } from 'react';
import appointmentApi from '../../api/appointmentApi';
import { getErrorMessage } from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import AppointmentFilters from '../../components/admin/AppointmentFilters';
import AppointmentTable from '../../components/admin/AppointmentTable';
import { formatDate, formatTime } from '../../utils/formatters';

const EMPTY_FILTERS = { doctor: '', patient: '', date: '', status: '' };

export default function AdminAppointmentsPage() {
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);

  const [result, setResult] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    // Only send filters that actually have a value.
    const params = { page: page, limit: 20 };
    if (applied.doctor) params.doctor = applied.doctor;
    if (applied.patient) params.patient = applied.patient;
    if (applied.date) params.date = applied.date;
    if (applied.status) params.status = applied.status;

    appointmentApi
      .getAdminAppointments(params)
      .then((data) => {
        if (active) setResult(data);
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
  }, [applied, page, refresh]);

  function applyFilters(filters) {
    setNotice('');
    setPage(1);
    setApplied(filters);
  }

  function clearFilters() {
    setNotice('');
    setPage(1);
    setApplied(EMPTY_FILTERS);
  }

  async function changeStatus(appointment, status) {
    // Cancelling asks for an optional reason first.
    if (status === 'cancelled') {
      setCancelError('');
      setCancelReason('');
      setCancelTarget(appointment);
      return;
    }

    setBusyId(appointment._id);
    setActionError('');
    setNotice('');
    try {
      await appointmentApi.updateAdminAppointmentStatus(appointment._id, { status: status });
      setNotice('Appointment marked as ' + status + '.');
      setRefresh(refresh + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelBusy(true);
    setCancelError('');
    try {
      await appointmentApi.updateAdminAppointmentStatus(cancelTarget._id, {
        status: 'cancelled',
        cancellationReason: cancelReason.trim(),
      });
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

  let pages = result.pages;
  if (!pages || pages < 1) pages = 1;
  const currentPage = Math.min(page, pages);

  let content = null;
  if (loading) {
    content = <Loading label="Loading appointments…" />;
  } else if (!error) {
    if (result.items.length === 0) {
      content = (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">📋</span>
          <h3>No appointments match</h3>
          <p>Try different filters or clear them to see all sample appointments.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      );
    } else {
      content = (
        <>
          <AppointmentTable items={result.items} busyId={busyId} onStatusChange={changeStatus} />

          {pages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                ← Previous
              </button>
              <span className="pagination__label">Page {currentPage} of {pages}</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={currentPage >= pages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      );
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">All appointments</h1>
          <p className="page-subtitle">Filter sample appointments and update their status.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setRefresh(refresh + 1)}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {notice && <div className="alert alert--success">{notice}</div>}
      {actionError && <ErrorMessage message={actionError} title="Status update failed" />}

      <AppointmentFilters onApply={applyFilters} onClear={clearFilters} loading={loading} />

      {!loading && !error && (
        <p className="result-count">{result.total} appointment{result.total === 1 ? '' : 's'} found.</p>
      )}

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
            if (event.target === event.currentTarget && !cancelBusy) setCancelTarget(null);
          }}
        >
          <div className="modal modal--small" role="dialog" aria-modal="true" aria-labelledby="admin-cancel-title">
            <div className="modal__header">
              <h2 id="admin-cancel-title">Cancel this appointment?</h2>
              <button
                type="button"
                className="modal__close"
                onClick={() => setCancelTarget(null)}
                disabled={cancelBusy}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal__body">
              <p>
                {cancelTarget.patient.name} with {cancelTarget.doctor.name} on{' '}
                <strong>{formatDate(cancelTarget.date)}</strong> at{' '}
                <strong>{formatTime(cancelTarget.time)}</strong>.
              </p>
              <div className="field" style={{ marginTop: 16 }}>
                <label htmlFor="admin-cancel-reason">Cancellation reason (optional)</label>
                <textarea
                  id="admin-cancel-reason"
                  value={cancelReason}
                  maxLength={300}
                  placeholder="Add a short reason…"
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
              <button type="button" className="btn btn-outline" onClick={() => setCancelTarget(null)} disabled={cancelBusy}>
                Keep it
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmCancel} disabled={cancelBusy}>
                {cancelBusy ? 'Cancelling…' : 'Cancel appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
