import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import appointmentApi from '../../api/appointmentApi';
import { getErrorMessage } from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import StatCard from '../../components/admin/StatCard';

const EMPTY_COUNTS = {
  doctors: 0,
  patients: 0,
  appointments: 0,
  pending: 0,
  confirmed: 0,
  completed: 0,
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    appointmentApi
      .getAdminDashboard()
      .then((data) => {
        if (active) setCounts(data);
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
  }, [refresh]);

  // Each card shows one number from the dashboard API.
  const stats = [
    { label: 'Doctors', value: counts.doctors, tone: '' },
    { label: 'Patients', value: counts.patients, tone: '' },
    { label: 'Appointments', value: counts.appointments, tone: '' },
    { label: 'Pending', value: counts.pending, tone: 'stat-card--pending' },
    { label: 'Confirmed', value: counts.confirmed, tone: 'stat-card--confirmed' },
    { label: 'Completed', value: counts.completed, tone: 'stat-card--completed' },
  ];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin dashboard</h1>
          <p className="page-subtitle">A quick snapshot of the sample clinic activity.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setRefresh(refresh + 1)}
          disabled={loading}
        >
          Refresh data
        </button>
      </div>

      <ErrorMessage
        message={error}
        title="Dashboard unavailable"
        onRetry={() => setRefresh(refresh + 1)}
      />

      {loading ? (
        <Loading label="Loading dashboard numbers…" />
      ) : (
        !error && (
          <>
            <div className="stats-grid">
              {stats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
              ))}
            </div>

            <div className="quick-links">
              <Link to="/admin/doctors" className="btn btn-primary">Manage doctors</Link>
              <Link to="/admin/appointments" className="btn btn-outline">Review appointments</Link>
              <Link to="/profile" className="btn btn-ghost">My profile</Link>
            </div>
          </>
        )
      )}
    </div>
  );
}
