import { useState } from 'react';
import { APPOINTMENT_STATUSES } from '../../utils/constants';

export default function AppointmentFilters({ onApply, onClear, loading }) {
  const [doctor, setDoctor] = useState('');
  const [patient, setPatient] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onApply({
      doctor: doctor.trim(),
      patient: patient.trim(),
      date: date,
      status: status,
    });
  }

  function handleClear() {
    setDoctor('');
    setPatient('');
    setDate('');
    setStatus('');
    onClear();
  }

  return (
    <form className="filter-bar filter-bar--admin" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="filter-doctor">Doctor</label>
        <input
          id="filter-doctor"
          type="text"
          placeholder="Name or doctor ID"
          value={doctor}
          onChange={(event) => setDoctor(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="filter-patient">Patient</label>
        <input
          id="filter-patient"
          type="text"
          placeholder="Name or patient ID"
          value={patient}
          onChange={(event) => setPatient(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="filter-date">Date</label>
        <input
          id="filter-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="filter-status">Status</label>
        <select id="filter-status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {APPOINTMENT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>Apply filters</button>
      <button type="button" className="btn btn-outline" onClick={handleClear} disabled={loading}>
        Clear
      </button>
    </form>
  );
}
