/** Appointment booking controllers. Cancel/reschedule live in a companion file. */
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const api = require('../utils/apiResponse');
const slots = require('../utils/slots');

const POPULATE_FIELDS = [
  { path: 'doctor', select: 'name specialty qualification' },
  { path: 'patient', select: 'name email phone' },
];

/** Reload one appointment with readable doctor and patient details. */
function populatedAppointment(id) {
  return Appointment.findById(id).populate(POPULATE_FIELDS);
}

/** POST /api/appointments — patient only. */
async function createAppointment(req, res, next) {
  try {
    const body = req.body;

    const doctor = await Doctor.findById(body.doctor);
    if (!doctor) {
      throw new api.ApiError(404, 'Doctor not found');
    }
    if (!doctor.isActive) {
      throw new api.ApiError(409, 'Doctor is not available for booking');
    }

    if (doctor.availableSlots.indexOf(body.time) === -1) {
      const message = `Time ${body.time} is not an available slot for this doctor`;
      throw new api.ApiError(400, message);
    }

    // This check gives a clear 409. The unique index is the final safety net.
    const conflict = await Appointment.findActiveConflict(
      body.doctor,
      body.date,
      body.time
    );
    if (conflict) {
      throw new api.ApiError(409, 'This appointment slot is already booked');
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: body.doctor,
      date: body.date,
      time: body.time,
      reason: body.reason || '',
      status: 'pending',
    });

    const populated = await populatedAppointment(appointment._id);

    return api.sendSuccess(res, {
      status: 201,
      message: 'Appointment booked successfully',
      data: { appointment: populated },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new api.ApiError(409, 'This appointment slot is already booked'));
    }
    return next(error);
  }
}

/** Does one appointment belong in the requested scope? */
function matchesScope(appointment, scope) {
  if (scope === 'all') return true;

  if (scope === 'cancelled') {
    return appointment.status === 'cancelled';
  }

  if (appointment.status === 'cancelled') return false;

  const past = slots.isPastAppointment(appointment);

  if (scope === 'past') {
    if (past) return true;
    return appointment.status === 'completed';
  }

  if (scope === 'upcoming') return !past;

  return true;
}

/** GET /api/appointments/my — patient only. */
async function getMyAppointments(req, res, next) {
  try {
    const pageInfo = api.getPagination(req.query, 10, 50);
    const scope = String(req.query.scope || 'all').toLowerCase();

    const appointments = await Appointment.find({ patient: req.user._id })
      .populate(POPULATE_FIELDS)
      .sort({ date: 1, time: 1 })
      .lean();

    const filtered = [];
    for (let i = 0; i < appointments.length; i += 1) {
      if (matchesScope(appointments[i], scope)) {
        filtered.push(appointments[i]);
      }
    }

    const total = filtered.length;
    const items = filtered.slice(pageInfo.skip, pageInfo.skip + pageInfo.limit);

    return api.sendList(res, {
      items: items,
      page: pageInfo.page,
      pages: Math.ceil(total / pageInfo.limit),
      total: total,
    });
  } catch (error) {
    return next(error);
  }
}

/** GET /api/appointments/:id — the owner patient or an admin. */
async function getAppointmentById(req, res, next) {
  try {
    const appointment = await populatedAppointment(req.params.id);
    if (!appointment) {
      throw new api.ApiError(404, 'Appointment not found');
    }

    let isOwner = false;
    if (req.user.role === 'admin') {
      isOwner = true;
    } else if (appointment.patient) {
      isOwner = String(appointment.patient._id) === String(req.user._id);
    }

    if (!isOwner) {
      throw new api.ApiError(403, 'You are not allowed to view this appointment');
    }

    return api.sendSuccess(res, {
      message: 'Appointment retrieved',
      data: { appointment: appointment },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createAppointment, getMyAppointments, getAppointmentById };
