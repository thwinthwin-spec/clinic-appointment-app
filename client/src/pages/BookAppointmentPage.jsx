import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import doctorApi from '../api/doctorApi';
import appointmentApi from '../api/appointmentApi';
import { getErrorMessage } from '../api/axios';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import SlotPicker from '../components/SlotPicker';
import { BOOKING_NOTICE } from '../utils/constants';
import {
  addDaysDate,
  formatTime,
  formatWorkingHours,
  getInitials,
  getTodayDate,
} from '../utils/formatters';

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // The doctor detail page can pass a chosen date and time through router state.
  let initialDate = addDaysDate(1);
  let initialTime = '';
  if (location.state) {
    if (location.state.date) initialDate = location.state.date;
    if (location.state.time) initialTime = location.state.time;
  }

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [reason, setReason] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [reasonError, setReasonError] = useState('');

  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState('');

  const [slots, setSlots] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [slotRefresh, setSlotRefresh] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [conflictError, setConflictError] = useState('');

  // Load the doctor being booked.
  useEffect(() => {
    if (!doctorId) return undefined;
    let active = true;
    setDoctorLoading(true);
    setDoctorError('');

    doctorApi
      .getDoctor(doctorId)
      .then((data) => {
        if (active) setDoctor(data);
      })
      .catch((err) => {
        if (active) setDoctorError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setDoctorLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctorId]);

  // Load the open slots for the chosen date.
  useEffect(() => {
    if (!doctorId || !date) return undefined;
    let active = true;
    setSlotLoading(true);
    setSlotError('');
    setConflictError('');

    doctorApi
      .getSlots(doctorId, date)
      .then((data) => {
        if (active) setSlots(data);
      })
      .catch((err) => {
        if (active) {
          setSlots(null);
          setSlotError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (active) setSlotLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctorId, date, slotRefresh]);

  function validate() {
    let valid = true;
    setDateError('');
    setTimeError('');
    setReasonError('');

    if (!date) {
      setDateError('Choose an appointment date.');
      valid = false;
    }
    if (!time) {
      setTimeError('Choose an available time slot.');
      valid = false;
    }
    if (!reason.trim()) {
      setReasonError('Please tell us the reason for your visit.');
      valid = false;
    } else if (reason.trim().length < 5) {
      setReasonError('Add a little more detail (at least 5 characters).');
      valid = false;
    } else if (reason.trim().length > 500) {
      setReasonError('Please keep the reason under 500 characters.');
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    setConflictError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await appointmentApi.createAppointment({
        doctor: doctorId,
        date: date,
        time: time,
        reason: reason.trim(),
      });
      navigate('/appointments', { state: { message: BOOKING_NOTICE } });
    } catch (err) {
      // 409 means somebody else took the slot just before us.
      if (err.status === 409) {
        setConflictError('That time slot was just booked by someone else. Please pick another time.');
        setTime('');
      } else {
        setServerError(err.message || 'Your appointment could not be booked.');
      }
      setSlotRefresh(slotRefresh + 1);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDateChange(event) {
    setDate(event.target.value);
    setTime('');
    setDateError('');
    setTimeError('');
    setConflictError('');
  }

  function handleSlotSelect(value) {
    setTime(value);
    setTimeError('');
    setConflictError('');
  }

  if (doctorLoading) {
    return <div className="container"><Loading label="Preparing the booking form…" /></div>;
  }

  if (doctorError || !doctor) {
    return (
      <div className="container container--narrow">
        <ErrorMessage
          message={doctorError || 'This doctor is not available right now.'}
          title="Booking unavailable"
          onRetry={() => window.location.reload()}
        />
        <Link to="/doctors" className="btn btn-outline">← Back to doctors</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link to={'/doctors/' + doctorId} className="text-small">← Back to doctor</Link>
          <h1 className="page-title" style={{ marginTop: 8 }}>Book an appointment</h1>
          <p className="page-subtitle">Choose a date and an open slot, then add a short reason.</p>
        </div>
      </div>

      <div className="grid detail-grid">
        <form className="card form-card" onSubmit={handleSubmit} noValidate>
          <h2 className="section-title">Appointment details</h2>

          {conflictError && (
            <div className="alert alert--error" role="alert">
              <div><strong>Slot no longer available</strong><p>{conflictError}</p></div>
            </div>
          )}

          <ErrorMessage message={serverError} title="Booking failed" />

          <div className="form-grid">
            <div className="field">
              <label htmlFor="booking-date">Date</label>
              <input
                id="booking-date"
                type="date"
                min={getTodayDate()}
                value={date}
                onChange={handleDateChange}
                aria-invalid={Boolean(dateError)}
                disabled={submitting}
                required
              />
              {dateError && <span className="inline-error">{dateError}</span>}
            </div>

            <div>
              <SlotPicker
                slots={slots}
                selected={time}
                onSelect={handleSlotSelect}
                loading={slotLoading}
                error={slotError}
              />
              {timeError && <span className="inline-error">{timeError}</span>}
              {slotError && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 8 }}
                  onClick={() => setSlotRefresh(slotRefresh + 1)}
                  disabled={submitting}
                >
                  Retry slots
                </button>
              )}
            </div>

            <div className="field">
              <label htmlFor="booking-reason">Reason for visit</label>
              <textarea
                id="booking-reason"
                placeholder="Briefly describe what you would like to discuss…"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setReasonError('');
                }}
                aria-invalid={Boolean(reasonError)}
                maxLength={500}
                disabled={submitting}
                required
              />
              {reasonError && <span className="inline-error">{reasonError}</span>}
              <span className="text-muted text-small">{reason.length}/500 characters</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting || slotLoading}>
              {submitting ? 'Booking…' : 'Confirm appointment'}
            </button>
            <Link to="/doctors" className="btn btn-outline">Cancel</Link>
          </div>
        </form>

        <aside className="card">
          <h2 className="section-title">Your selection</h2>
          <div className="doctor-card__top">
            <span className="avatar avatar--large" aria-hidden="true">{getInitials(doctor.name)}</span>
            <div>
              <h3>{doctor.name}</h3>
              <p className="text-muted">{doctor.specialty}</p>
            </div>
          </div>
          <dl className="detail-list">
            <div><dt>Qualification</dt><dd>{doctor.qualification || 'Not specified'}</dd></div>
            <div><dt>Working hours</dt><dd>{formatWorkingHours(doctor.workingHours)}</dd></div>
            <div><dt>Date</dt><dd>{date || 'Not selected'}</dd></div>
            <div><dt>Time</dt><dd>{time ? formatTime(time) : 'Not selected'}</dd></div>
          </dl>
          <p className="text-muted text-small" style={{ marginTop: 16 }}>
            Please use fictional details only — this is a demo application.
          </p>
        </aside>
      </div>
    </div>
  );
}
