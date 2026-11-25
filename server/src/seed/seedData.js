/**
 * Idempotent demo data seeder. Run with: npm run seed
 *
 * - Adds the demo admin and patient accounts.
 * - Adds 6 doctors across 5 specialties.
 * - Adds 8 fictional appointments with upcoming, past and cancelled examples.
 * Running it again updates the same records instead of creating duplicates.
 */
const bcrypt = require('bcryptjs');

const env = require('../config/env');
const db = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const slots = require('../utils/slots');
const constants = require('./seedConstants');

const DOCTORS = constants.DOCTORS;
const APPOINTMENTS = constants.APPOINTMENTS;

/** Upsert the two demo accounts. Returns the admin and patient documents. */
async function seedUsers() {
  const adminHash = await bcrypt.hash(env.seed.adminPassword, 12);
  const patientHash = await bcrypt.hash(env.seed.patientPassword, 12);

  const admin = await User.findOneAndUpdate(
    { email: env.seed.adminEmail },
    {
      $setOnInsert: {
        name: 'Clinic Administrator',
        password: adminHash,
        phone: '',
      },
      $set: { role: 'admin' },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  const patient = await User.findOneAndUpdate(
    { email: env.seed.patientEmail },
    {
      $setOnInsert: {
        name: 'Demo Patient',
        password: patientHash,
        phone: '',
      },
      $set: { role: 'patient' },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  return { admin: admin, patient: patient };
}

/** Upsert one doctor and return the saved document. */
async function seedOneDoctor(info, adminId) {
  const doctor = await Doctor.findOneAndUpdate(
    { name: info.name, specialty: info.specialty },
    {
      $setOnInsert: {
        name: info.name,
        specialty: info.specialty,
        qualification: info.qualification,
        experienceYears: info.experienceYears,
        workingHours: constants.WORKING_HOURS,
        slotDurationMinutes: 30,
        availableSlots: slots.DEFAULT_SLOTS,
        createdBy: adminId,
      },
      $set: { isActive: true },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  return doctor;
}

/** Upsert one fictional appointment. */
async function seedOneAppointment(item, patientId, doctorId) {
  const date = slots.dateOffset(item.dayOffset);
  const reason = item.cancellationReason || '';

  await Appointment.findOneAndUpdate(
    {
      patient: patientId,
      doctor: doctorId,
      date: date,
      time: item.time,
    },
    {
      $setOnInsert: {
        patient: patientId,
        doctor: doctorId,
        date: date,
        time: item.time,
        reason: item.reason,
        status: item.status,
        cancellationReason: reason,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );
}

/** Print a short summary after the seeding work is finished. */
async function printCounts() {
  const userCount = await User.countDocuments({});
  const doctorCount = await Doctor.countDocuments({});
  const appointmentCount = await Appointment.countDocuments({});

  console.log('Seed complete (idempotent).');
  console.log(`  Admin:   ${env.seed.adminEmail} / ${env.seed.adminPassword}`);
  console.log(`  Patient: ${env.seed.patientEmail} / ${env.seed.patientPassword}`);
  console.log(`  Doctors upserted: ${DOCTORS.length}`);
  console.log(`  Appointments upserted: ${APPOINTMENTS.length}`);
  console.log(
    `  Totals in DB -> users: ${userCount}, doctors: ${doctorCount}, appointments: ${appointmentCount}`
  );
}

async function seed() {
  try {
    await db.connectDB();

    // Make sure the partial unique index exists before adding appointments.
    await User.syncIndexes();
    await Doctor.syncIndexes();
    await Appointment.syncIndexes();

    const accounts = await seedUsers();

    const doctors = [];
    for (let i = 0; i < DOCTORS.length; i += 1) {
      const doctor = await seedOneDoctor(DOCTORS[i], accounts.admin._id);
      doctors.push(doctor);
    }

    for (let i = 0; i < APPOINTMENTS.length; i += 1) {
      const item = APPOINTMENTS[i];
      const doctor = doctors[item.doctorIndex];
      await seedOneAppointment(item, accounts.patient._id, doctor._id);
    }

    await printCounts();
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await db.disconnectDB();
  }
}

seed();

module.exports = seed;
