import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import doctorApi from '../api/doctorApi';
import { getErrorMessage } from '../api/axios';
import { PAGE_SIZE, SPECIALTIES } from '../utils/constants';

export default function DoctorListPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);

  const [result, setResult] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wait a short moment before searching so typing feels smooth.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Ask the API for doctors whenever a filter or the page changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    doctorApi
      .listDoctors({ search: search, specialty: specialty, page: page, limit: PAGE_SIZE })
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
  }, [search, specialty, page, refresh]);

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setSpecialty('');
    setPage(1);
  }

  function handleSpecialtyChange(event) {
    setSpecialty(event.target.value);
    setPage(1);
  }

  let pages = result.pages;
  if (!pages || pages < 1) pages = 1;
  const currentPage = Math.min(page, pages);

  // Decide what to show below the filter bar.
  let content = null;
  if (loading) {
    content = <Loading label="Finding doctors…" />;
  } else if (!error) {
    if (result.items.length === 0) {
      content = (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">🔍</span>
          <h3>No doctors found</h3>
          <p>Try a different name, specialty, or clear your filters.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      );
    } else {
      content = (
        <>
          <div className="grid doctor-grid">
            {result.items.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBook={(selected) => navigate('/book/' + selected._id)}
              />
            ))}
          </div>

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
          <h1 className="page-title">Find a doctor</h1>
          <p className="page-subtitle">
            Browse sample clinicians and reserve an available appointment slot.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div>
          <label htmlFor="doctor-search">Search</label>
          <input
            id="doctor-search"
            type="search"
            placeholder="Search by name or specialty…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="specialty-filter">Specialty</label>
          <select id="specialty-filter" value={specialty} onChange={handleSpecialtyChange}>
            <option value="">All specialties</option>
            {SPECIALTIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={clearFilters}
          disabled={!searchInput && !specialty}
        >
          Clear filters
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setRefresh(refresh + 1)}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {!loading && !error && (
        <p className="result-count">
          {result.total} sample doctor{result.total === 1 ? '' : 's'} found
          {(search || specialty) ? ' for your filters' : ''}.
        </p>
      )}

      <ErrorMessage
        message={error}
        title="Doctors could not be loaded"
        onRetry={() => setRefresh(refresh + 1)}
      />

      {content}
    </div>
  );
}
