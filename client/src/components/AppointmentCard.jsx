import { useEffect, useState } from 'react';
import doctorApi from '../api/doctorApi';
import { getErrorMessage } from '../api/axios';
import SlotPicker from './SlotPicker';
import StatusBadge from './StatusBadge';
import {
  formatDateLong,
  formatTime,
  getTodayDate,
  isCancellable,
  isReschedulable,
  toDateInputValue,
} from '../utils/formatters';

export default function AppointmentCard({ appointment, onCancel, onReschedule }) {
  const status = appointment ? appointment.status : 'pending';
  let initialDate = getTodayDate();
  if (appointment && appointment.date) initialDate = toDateInputValue(appointment.date);

  const [rescheduling, setRescheduling] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  // Load fresh slots when the patient opens the reschedule form or changes date.
  useEffect(() => {
    if (!rescheduling || !appointment) return undefined;
    const doctorId = appointment.doctor._id;
    let active = true;

    setSlotLoading(true);
    setSlotError('');
    setTime('');

    doctorApi
      .getSlots(doctorId, date)
      .then((data) => {
        if (active) setSlots(data);
      })
      .catch((err) => {
        if (active) {
          setSlots(null);
          setSlotError(getErrorMessage(err, 'Time slots could not be loaded.'));
        }
      })
      .finally(() => {
        if (active) setSlotLoading(false);
      });

    return () => {
      active = false;
    };
  }, [rescheduling, date, appointment]);

  if (!appointment) return null;

  async function submitReschedule(event) {
    event.preventDefault();
    setActionError('');

    if (!date || !time) {
      setActionError('Please choose both a date and a time.');
      return;
    }
    if (!onReschedule) return;

    setBusy(true);
    try {
      await onReschedule(appointment._id, { date: date, time: time });
      setRescheduling(false);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function closeReschedule() {
    setRescheduling(false);
    setActionError('');
  }

  return (
    <article className="card appointment-card">
      <div className="appointment-card__head">
        <div>
          <h3>{appointment.doctor.name}</h3>
          <p className="text-muted">{appointment.doctor.specialty}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="appointment-card__meta">
        <div>
          <span className="meta-label">Date</span>
          <strong>{formatDateLong(appointment.date)}</strong>
        </div>
        <div>
          <span className="meta-label">Time</span>
          <strong>{formatTime(appointment.time)}</strong>
        </div>
      </div>

      {appointment.reason && (
        <p className="appointment-card__reason">
          <span className="meta-label">Reason</span>
          {appointment.reason}
        </p>
      )}

      {status === 'cancelled' && appointment.cancellationReason && (
        <p className="appointment-card__reason text-muted">
          <span className="meta-label">Cancellation reason</span>
          {appointment.cancellationReason}
        </p>
      )}

      {rescheduling ? (
        <form className="inline-reschedule" onSubmit={submitReschedule}>
          <div className="field">
            <label htmlFor={'reschedule-date-' + appointment._id}>New date</label>
            <input
              id={'reschedule-date-' + appointment._id}
              type="date"
              value={date}
              min={getTodayDate()}
              onChange={(event) => setDate(event.target.value)}
              disabled={busy}
              required
            />
          </div>

          <SlotPicker
            slots={slots}
            selected={time}
            onSelect={setTime}
            loading={slotLoading}
            error={slotError}
            emptyMessage="No slots on this date. Choose another date."
          />

          {actionError && <p className="inline-error">{actionError}</p>}

          <div className="inline-reschedule__actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? 'Saving…' : 'Save new time'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={closeReschedule}>
              Never mind
            </button>
          </div>
        </form>
      ) : (
        <div className="card-actions">
          {isReschedulable(status) && onReschedule && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRescheduling(true)}>
              Reschedule
            </button>
          )}
          {isCancellable(status) && onCancel && (
            <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => onCancel(appointment)}>
              Cancel appointment
            </button>
          )}
        </div>
      )}
    </article>
  );
}
