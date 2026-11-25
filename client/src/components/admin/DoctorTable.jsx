import { formatWorkingHours, getInitials } from '../../utils/formatters';

export default function DoctorTable({ doctors, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Specialty</th>
            <th>Experience</th>
            <th>Working hours</th>
            <th>Slots</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => {
            let slotCount = 0;
            if (Array.isArray(doctor.availableSlots)) {
              slotCount = doctor.availableSlots.length;
            }

            let statusClass = 'status-badge status-badge--completed';
            let statusLabel = 'Active';
            if (doctor.isActive === false) {
              statusClass = 'status-badge status-badge--cancelled';
              statusLabel = 'Inactive';
            }

            return (
              <tr key={doctor._id}>
                <td>
                  <div className="doctor-card__top" style={{ marginBottom: 0 }}>
                    <span className="avatar avatar--small" aria-hidden="true">
                      {getInitials(doctor.name)}
                    </span>
                    <span>
                      <span className="table__name">{doctor.name}</span>
                      <br />
                      <span className="text-muted text-small">{doctor.qualification}</span>
                    </span>
                  </div>
                </td>
                <td>{doctor.specialty}</td>
                <td>{doctor.experienceYears} yrs</td>
                <td className="text-small">{formatWorkingHours(doctor.workingHours)}</td>
                <td>{slotCount}</td>
                <td><span className={statusClass}>{statusLabel}</span></td>
                <td>
                  <div className="table__actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(doctor)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => onDelete(doctor)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
