/** Small helpers that turn API values into text for the screen. */

export function isAdmin(user) {
  if (!user) return false;
  return String(user.role).toLowerCase() === 'admin';
}

export function isPatient(user) {
  if (!user) return false;
  return String(user.role).toLowerCase() === 'patient';
}

export function capitalize(value) {
  const text = String(value || '');
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Convert a date into the YYYY-MM-DD format used by <input type="date">.
export function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function getTodayDate() {
  return toDateInputValue(new Date());
}

export function addDaysDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateLong(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Times from the API are already "HH:mm", so just display them.
export function formatTime(value) {
  if (!value) return '—';
  return String(value).slice(0, 5);
}

// Our doctor records store workingHours as { days, start, end }.
export function formatWorkingHours(hours) {
  if (!hours) return 'Not specified';
  const days = hours.days;
  if (!Array.isArray(days) || days.length === 0) return 'Not specified';

  const dayText = days.join(', ');
  if (!hours.start || !hours.end) return dayText;
  return dayText + ' · ' + formatTime(hours.start) + ' – ' + formatTime(hours.end);
}

export function getInitials(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  let initials = '';
  if (parts[0]) initials = initials + parts[0].charAt(0).toUpperCase();
  if (parts[1]) initials = initials + parts[1].charAt(0).toUpperCase();
  if (!initials) return '?';
  return initials;
}

export function isCancellable(status) {
  if (status === 'pending') return true;
  if (status === 'confirmed') return true;
  return false;
}

export function isReschedulable(status) {
  if (status === 'pending') return true;
  if (status === 'confirmed') return true;
  return false;
}
