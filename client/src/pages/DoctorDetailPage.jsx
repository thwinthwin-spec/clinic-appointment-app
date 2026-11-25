import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import SlotPicker from '../components/SlotPicker';
import doctorApi from '../api/doctorApi';
import { getErrorMessage } from '../api/axios';
import { formatTime, formatWorkingHours, getInitials, getTodayDate } from '../utils/formatters';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const [date, setDate] = useState(getTodayDate);
  const [slots, setSlots] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slotRefresh, setSlotRefresh] = useState(0);

  // Load the doctor profile.
  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    setDoctorLoading(true);
    setDoctorError('');

    doctorApi
      .getDoctor(id)
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
  }, [id, refresh]);

  // Load slots for the chosen date.
  useEffect(() => {
    if (!id || !date) return undefined;
    let active = true;
    setSlotLoading(true);
    setSlotError('');
    setSelectedTime('');

    doctorApi
      .getSlots(id, date)
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
  }, [id, date, slotRefresh]);

  if (doctorLoading) {
    return <div className="container"><Loading label="Loading doctor details…" /></div>;
  }

  if (doctorError || !doctor) {
    return (
      <div className="container container--narrow">
        <ErrorMessage
          message={doctorError || 'This sample doctor record is not available.'}
          title="Doctor unavailable"
          onRetry={() => setRefresh(refresh + 1)}
        />
        <Link to="/doctors" className="btn btn-outline">← Back to doctors</Link>
      </div>
    );
  }

  let years = 'Not specified';
  if (typeof doctor.experienceYears === 'number') {
    years = doctor.experienceYears + ' years';
  }

  let regularSlots = null;
  if (Array.isArray(doctor.availableSlots) && doctor.availableSlots.length > 0) {
    const times = doctor.availableSlots.map((slot) => formatTime(slot)).join(' · ');
    regularSlots = (
      <p className="appointment-card__reason text-small">
        <span className="meta-label">Regular sample slots</span>
        {times}
      </p>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link to="/doctors" className="text-small">← Back to doctors</Link>
          <h1 className="page-title" style={{ marginTop: 8 }}>{doctor.name}</h1>
          <p className="page-subtitle">{doctor.specialty}</p>
        </div>
      </div>

      <div className="grid detail-grid">
        <section className="card">
          <div className="doctor-card__top">
            <span className="avatar avatar--large" aria-hidden="true">
              {getInitials(doctor.name)}
            </span>
            <div>
              <h2 className="section-title" style={{ marginBottom: 2 }}>{doctor.name}</h2>
              <p className="text-muted">{doctor.specialty}</p>
            </div>
          </div>

          <dl className="detail-list">
            <div>
              <dt>Qualification</dt>
              <dd>{doctor.qualification || 'Not specified'}</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>{years}</dd>
            </div>
            <div>
              <dt>Working hours</dt>
              <dd>{formatWorkingHours(doctor.workingHours)}</dd>
            </div>
            <div>
              <dt>Slot length</dt>
              <dd>{doctor.slotDurationMinutes} minutes</dd>
            </div>
          </dl>

          {doctor.bio && (
            <p className="appointment-card__reason">
              <span className="meta-label">About</span>
              {doctor.bio}
            </p>
          )}

          {regularSlots}
        </section>

        <aside className="card">
          <h2 className="section-title">Pick an appointment time</h2>

          <div className="field">
            <label htmlFor="detail-date">Date</label>
            <input
              id="detail-date"
              type="date"
              min={getTodayDate()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <SlotPicker
              slots={slots}
              selected={selectedTime}
              onSelect={setSelectedTime}
              loading={slotLoading}
              error={slotError}
            />
          </div>

          {slotError && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => setSlotRefresh(slotRefresh + 1)}
            >
              Retry slots
            </button>
          )}

          <div className="card-actions">
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!selectedTime || slotLoading}
              onClick={() => navigate('/book/' + id, { state: { date: date, time: selectedTime } })}
            >
              {selectedTime ? 'Continue with ' + formatTime(selectedTime) : 'Select a time first'}
            </button>
          </div>

          <p className="text-muted text-small" style={{ marginTop: 12 }}>
            Availability shown here is sample data for this demo.
          </p>
        </aside>
      </div>
    </div>
  );
}
