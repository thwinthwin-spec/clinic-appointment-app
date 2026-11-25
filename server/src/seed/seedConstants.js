/** Plain demo data used by seedData.js. No real patient information. */

const WORKING_HOURS = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  start: '09:00',
  end: '17:00',
};

const DOCTORS = [
  {
    name: 'Dr. Aisha Rahman',
    specialty: 'General Physician',
    qualification: 'MBBS, MD (Internal Medicine)',
    experienceYears: 9,
  },
  {
    name: 'Dr. Vikram Mehta',
    specialty: 'General Physician',
    qualification: 'MBBS, DNB (Family Medicine)',
    experienceYears: 12,
  },
  {
    name: 'Dr. Neha Kapoor',
    specialty: 'Cardiologist',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experienceYears: 15,
  },
  {
    name: 'Dr. Arjun Nair',
    specialty: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experienceYears: 8,
  },
  {
    name: 'Dr. Meera Iyer',
    specialty: 'Pediatrician',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    experienceYears: 11,
  },
  {
    name: 'Dr. Rohan Sharma',
    specialty: 'Orthopedist',
    qualification: 'MBBS, MS (Orthopedics)',
    experienceYears: 14,
  },
];

// doctorIndex points at the DOCTORS list above.
// dayOffset is relative to today in UTC, so the mix stays meaningful.
const APPOINTMENTS = [
  {
    doctorIndex: 0,
    dayOffset: 1,
    time: '09:00',
    status: 'pending',
    reason: 'Routine checkup',
  },
  {
    doctorIndex: 2,
    dayOffset: 2,
    time: '10:30',
    status: 'confirmed',
    reason: 'Follow-up visit',
  },
  {
    doctorIndex: 3,
    dayOffset: 3,
    time: '14:00',
    status: 'pending',
    reason: 'Routine checkup',
  },
  {
    doctorIndex: 4,
    dayOffset: 4,
    time: '11:00',
    status: 'confirmed',
    reason: 'Follow-up visit',
  },
  {
    doctorIndex: 5,
    dayOffset: -5,
    time: '09:30',
    status: 'completed',
    reason: 'Routine checkup',
  },
  {
    doctorIndex: 0,
    dayOffset: -10,
    time: '15:00',
    status: 'completed',
    reason: 'Follow-up visit',
  },
  {
    doctorIndex: 1,
    dayOffset: 6,
    time: '14:30',
    status: 'cancelled',
    reason: 'Routine checkup',
    cancellationReason: 'Patient requested cancellation',
  },
  {
    doctorIndex: 5,
    dayOffset: -2,
    time: '10:00',
    status: 'cancelled',
    reason: 'Follow-up visit',
    cancellationReason: 'Schedule conflict',
  },
];

module.exports = { WORKING_HOURS, DOCTORS, APPOINTMENTS };
