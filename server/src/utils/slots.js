/**
 * Small date/time helpers used by models, controllers and routes.
 * This file has no database or network code.
 */

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const ALLOWED_DAYS = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
  '0', '1', '2', '3', '4', '5', '6',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];

const DEFAULT_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '14:00', '14:30', '15:00',
];

/** True only for a real calendar date written as YYYY-MM-DD. */
function isValidDateString(value) {
  if (typeof value !== 'string') return false;
  if (!DATE_PATTERN.test(value)) return false;

  const parts = value.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  // Date.UTC rolls invalid days over, so compare the parts afterwards.
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (parsed.getUTCFullYear() !== year) return false;
  if (parsed.getUTCMonth() !== month - 1) return false;
  if (parsed.getUTCDate() !== day) return false;

  return true;
}

/** True only for a time written as HH:mm. */
function isValidTimeString(value) {
  if (typeof value !== 'string') return false;
  return TIME_PATTERN.test(value);
}

/** Today's UTC date as YYYY-MM-DD. */
function todayDateString(now) {
  const current = now || new Date();
  return current.toISOString().slice(0, 10);
}

/** A date relative to today, as YYYY-MM-DD. Negative days go into the past. */
function dateOffset(days, now) {
  const current = now || new Date();

  const date = new Date(
    Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth(),
      current.getUTCDate() + days
    )
  );

  return date.toISOString().slice(0, 10);
}

/** Combine a date and a time into a UTC Date. Returns null for bad input. */
function toDateTime(date, time) {
  if (!isValidDateString(date)) return null;
  if (!isValidTimeString(time)) return null;

  const value = new Date(`${date}T${time}:00.000Z`);
  return value;
}

/** Does the doctor work on this calendar date? */
function isWorkingDay(doctor, date) {
  if (!doctor) return false;
  if (!doctor.workingHours) return false;
  if (!Array.isArray(doctor.workingHours.days)) return false;

  const dateTime = toDateTime(date, '00:00');
  if (!dateTime) return false;

  const dayNumber = dateTime.getUTCDay();
  const dayName = DAY_NAMES[dayNumber];
  const days = doctor.workingHours.days;

  for (let i = 0; i < days.length; i += 1) {
    if (String(days[i]) === dayName) return true;
    if (Number(days[i]) === dayNumber) return true;
  }

  return false;
}

/** Sorted, unique HH:mm values taken from active appointment documents. */
function getBookedTimes(appointments) {
  const times = [];

  if (!Array.isArray(appointments)) return times;

  for (let i = 0; i < appointments.length; i += 1) {
    const appointment = appointments[i];
    if (!appointment) continue;

    const active = ACTIVE_STATUSES.indexOf(appointment.status) !== -1;
    if (!active) continue;

    const alreadyAdded = times.indexOf(appointment.time) !== -1;
    if (!alreadyAdded) times.push(appointment.time);
  }

  times.sort();
  return times;
}

/** Doctor's configured slots minus the ones already booked. */
function getAvailableSlots(doctor, appointments) {
  const available = [];

  if (!doctor) return available;
  if (!Array.isArray(doctor.availableSlots)) return available;

  const booked = getBookedTimes(appointments);

  for (let i = 0; i < doctor.availableSlots.length; i += 1) {
    const slot = doctor.availableSlots[i];

    const isBooked = booked.indexOf(slot) !== -1;
    const isAdded = available.indexOf(slot) !== -1;

    if (!isBooked && !isAdded) available.push(slot);
  }

  return available;
}

/** True when the appointment date/time is strictly before `now`. */
function isPastAppointment(appointment, now) {
  if (!appointment) return false;

  const appointmentTime = toDateTime(appointment.date, appointment.time);
  if (!appointmentTime) return false;

  const current = now || new Date();
  return appointmentTime.getTime() < current.getTime();
}

/** Escape text before putting it inside a regular expression. */
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  TIME_PATTERN,
  DATE_PATTERN,
  ALLOWED_DAYS,
  ACTIVE_STATUSES,
  DEFAULT_SLOTS,
  isValidDateString,
  isValidTimeString,
  todayDateString,
  dateOffset,
  toDateTime,
  isWorkingDay,
  getBookedTimes,
  getAvailableSlots,
  isPastAppointment,
  escapeRegex,
};
