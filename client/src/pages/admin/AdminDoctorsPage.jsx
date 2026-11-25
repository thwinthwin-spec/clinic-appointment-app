import { useEffect, useState } from 'react';
import doctorApi from '../../api/doctorApi';
import { getErrorMessage } from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import DoctorFormModal from '../../components/admin/DoctorFormModal';
import DoctorTable from '../../components/admin/DoctorTable';
import { SPECIALTIES } from '../../utils/constants';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // The API caps page size at 50, which covers our sample catalogue.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    doctorApi
      .listDoctors({ limit: 50, page: 1 })
      .then((data) => {
        if (active) setDoctors(data.items);
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

  // Filter the loaded doctors in the browser for quick searching.
  const term = search.trim().toLowerCase();
  const filtered = [];
  doctors.forEach((doctor) => {
    if (specialtyFilter && doctor.specialty !== specialtyFilter) return;
    if (!term) {
      filtered.push(doctor);
      return;
    }
    const text = doctor.name + ' ' + doctor.specialty + ' ' + doctor.qualification;
    if (text.toLowerCase().indexOf(term) !== -1) filtered.push(doctor);
  });

  function openCreate() {
    setEditing(null);
    setNotice('');
    setFormOpen(true);
  }

  function openEdit(doctor) {
    setEditing(doctor);
    setNotice('');
    setFormOpen(true);
  }

  function handleSaved(message) {
    setFormOpen(false);
    setEditing(null);
    setNotice(message);
    setRefresh(refresh + 1);
  }

  function openDelete(doctor) {
    setDeleteError('');
    setDeleteTarget(doctor);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError('');
    setDeleteBusy(true);
    try {
      await doctorApi.deleteDoctor(deleteTarget._id);
      setDeleteTarget(null);
      setNotice('Doctor removed.');
      setRefresh(refresh + 1);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  }

  let content = null;
  if (loading) {
    content = <Loading label="Loading doctor records…" />;
  } else if (!error) {
    if (filtered.length === 0) {
      content = (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">🩺</span>
          <h3>No doctors to show</h3>
          <p>Add a sample doctor or adjust your search.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
            Add doctor
          </button>
        </div>
      );
    } else {
      content = (
        <>
          <p className="result-count">Showing {filtered.length} of {doctors.length} doctors.</p>
          <DoctorTable doctors={filtered} onEdit={openEdit} onDelete={openDelete} />
        </>
      );
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage doctors</h1>
          <p className="page-subtitle">Create, edit, and retire sample doctor profiles.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add doctor
        </button>
      </div>

      {notice && <div className="alert alert--success">{notice}</div>}

      <div className="filter-bar">
        <div>
          <label htmlFor="admin-doctor-search">Search doctors</label>
          <input
            id="admin-doctor-search"
            type="search"
            placeholder="Name, specialty, qualification…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="admin-specialty-filter">Specialty</label>
          <select
            id="admin-specialty-filter"
            value={specialtyFilter}
            onChange={(event) => setSpecialtyFilter(event.target.value)}
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
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

      <ErrorMessage
        message={error}
        title="Doctors could not be loaded"
        onRetry={() => setRefresh(refresh + 1)}
      />

      {content}

      {formOpen && (
        <DoctorFormModal doctor={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
      )}

      {deleteTarget && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleteBusy) setDeleteTarget(null);
          }}
        >
          <div className="modal modal--small" role="dialog" aria-modal="true" aria-labelledby="delete-doctor-title">
            <div className="modal__header">
              <h2 id="delete-doctor-title">Delete doctor?</h2>
              <button
                type="button"
                className="modal__close"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteBusy}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal__body">
              <p>
                Remove <strong>{deleteTarget.name}</strong> from the sample doctor list?
                This cannot be undone.
              </p>
              {deleteError && <p className="inline-error">{deleteError}</p>}
            </div>
            <div className="modal__footer">
              <button type="button" className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleteBusy}>
                Keep doctor
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleteBusy}>
                {deleteBusy ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
