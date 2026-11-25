import StatusBadge from '../StatusBadge';
import { formatDate, formatTime, isCancellable } from '../../utils/formatters';

export default function AppointmentTable({ items, busyId, onStatusChange }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((appointment) => {
            const id = appointment._id;
            const status = appointment.status;
            const disabled = busyId === id;

            // Pending can be confirmed, confirmed can be completed.
            let mainAction = null;
            if (status === 'pending') {
              mainAction = (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={disabled}
                  onClick={() => onStatusChange(appointment, 'confirmed')}
                >
                  Confirm
                </button>
              );
            } else if (status === 'confirmed') {
              mainAction = (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={disabled}
                  onClick={() => onStatusChange(appointment, 'completed')}
                >
                  Complete
                </button>
              );
            }

            // Pending and confirmed appointments can also be cancelled.
            let cancelAction = null;
            if (isCancellable(status)) {
              cancelAction = (
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  disabled={disabled}
                  onClick={() => onStatusChange(appointment, 'cancelled')}
                >
                  Cancel
                </button>
              );
            }

            let actions = (
              <>
                {mainAction}
                {cancelAction}
              </>
            );
            if (!mainAction && !cancelAction) {
              actions = <span className="text-muted text-small">No actions</span>;
            }

            return (
              <tr key={id}>
                <td className="table__name">{appointment.patient.name}</td>
                <td>{appointment.doctor.name}</td>
                <td>{formatDate(appointment.date)}</td>
                <td>{formatTime(appointment.time)}</td>
                <td className="text-small">{appointment.reason || '—'}</td>
                <td><StatusBadge status={status} /></td>
                <td><div className="table__actions">{actions}</div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
