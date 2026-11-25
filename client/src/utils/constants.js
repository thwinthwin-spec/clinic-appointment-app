/** Shared values used by both patients and administrators. */

export const DEFAULT_API_URL = 'http://localhost:5000/api';
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export const ROUTES = {
  login: '/login',
  register: '/register',
  doctors: '/doctors',
  appointments: '/appointments',
  profile: '/profile',
  admin: '/admin',
  adminDoctors: '/admin/doctors',
  adminAppointments: '/admin/appointments',
  notFound: '*',
};

// These names match the seeded doctors and the specialty filter.
export const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedist',
];

// The API only accepts these short day codes in workingHours.days.
export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// New doctors start with a normal Monday to Friday week.
export const DEFAULT_WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const APPOINTMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const APPOINTMENT_TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PAGE_SIZE = 9;
export const DEFAULT_SLOT_DURATION = 30;

// Fictional accounts shown on the sign-in screen.
export const DEMO_ACCOUNTS = [
  {
    label: 'Patient demo',
    email: 'patient@clinic.test',
    password: 'Patient@123',
  },
  {
    label: 'Admin demo',
    email: 'admin@clinic.test',
    password: 'Admin@123',
  },
];

export const BOOKING_NOTICE = 'Appointment booked successfully.';
