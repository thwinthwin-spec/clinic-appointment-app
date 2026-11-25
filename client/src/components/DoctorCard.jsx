import { Link, useNavigate } from 'react-router-dom';
import { formatWorkingHours, getInitials } from '../utils/formatters';

export default function DoctorCard({ doctor, onBook }) {
  const navigate = useNavigate();
  if (!doctor) return null;

  const id = doctor._id;
  const detailPath = '/doctors/' + id;

  function handleBook() {
    if (onBook) {
      onBook(doctor);
      return;
    }
    navigate('/book/' + id);
  }

  let experience = 'Not specified';
  if (typeof doctor.experienceYears === 'number') {
    let years = doctor.experienceYears + ' year';
    if (doctor.experienceYears !== 1) years = years + 's';
    experience = years;
  }

  return (
    <article className="card doctor-card">
      <div className="doctor-card__top">
        <span className="avatar avatar--large" aria-hidden="true">
          {getInitials(doctor.name)}
        </span>
        <div>
          <h3 className="doctor-card__name">{doctor.name}</h3>
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
          <dd>{experience}</dd>
        </div>
        <div>
          <dt>Working hours</dt>
          <dd>{formatWorkingHours(doctor.workingHours)}</dd>
        </div>
      </dl>

      <div className="card-actions">
        <Link to={detailPath} className="btn btn-outline btn-sm">View details</Link>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleBook}>
          Book appointment
        </button>
      </div>
    </article>
  );
}
