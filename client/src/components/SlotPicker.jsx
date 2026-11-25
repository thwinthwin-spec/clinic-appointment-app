import ErrorMessage from './ErrorMessage';
import Loading from './Loading';
import { formatTime } from '../utils/formatters';

export default function SlotPicker({
  slots,
  selected,
  onSelect,
  loading,
  error,
  label,
  emptyMessage,
}) {
  // Loading and errors are shown instead of the slot buttons.
  if (loading) return <Loading small label="Checking available slots…" />;
  if (error) return <ErrorMessage message={error} title="Slots unavailable" />;

  let available = [];
  let booked = [];
  if (slots) {
    available = slots.available;
    booked = slots.booked;
  }

  // Show booked times too, but as disabled buttons.
  const allTimes = available.concat(booked);
  allTimes.sort();

  const options = [];
  allTimes.forEach((time) => {
    if (options.indexOf(time) === -1) options.push(time);
  });

  if (options.length === 0) {
    const message = emptyMessage || 'No slots are available for this date. Please pick another day.';
    return (
      <div className="empty-state empty-state--compact">
        <span className="empty-state__icon" aria-hidden="true">🗓️</span>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="slot-picker">
      <div className="slot-picker__label">{label || 'Available time slots'}</div>
      <div className="slot-grid">
        {options.map((time) => {
          const isBooked = booked.indexOf(time) !== -1;
          let className = 'slot-button';
          if (selected === time) className = className + ' is-selected';
          if (isBooked) className = className + ' is-booked';

          return (
            <button
              key={time}
              type="button"
              className={className}
              disabled={isBooked}
              aria-pressed={selected === time}
              onClick={() => onSelect(time)}
            >
              <span>{formatTime(time)}</span>
              {isBooked && <small>Booked</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
