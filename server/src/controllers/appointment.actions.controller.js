/** Appointment cancel and reschedule controllers. */
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const api = require('../utils/apiResponse');

const POPULATE_FIELDS = [
  { path: 'doctor', select: 'name specialty qualification' },
  { path: 'patient', select: 'name email phone' },
];

function populatedAppointment(id) {
  return Appointment.findById(id).populate(POPULATE_FIELDS);
}

/** True when the user may change this appointment. */
function isOwner(req, appointment) {
  if (req.user.role === 'admin') return true;
  return String(appointment.patient) === String(req.user._id);
}

/** PATCH /api/appointments/:id/cancel — patient owner or admin. */
async function cancelAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      throw new api.ApiError(404, 'Appointment not found');
    }

    if (!isOwner(req, appointment)) {
      throw new api.ApiError(403, 'You are not allowed to cancel this appointment');
    }

    if (appointment.status === 'cancelled') {
      throw new api.ApiError(409, 'Appointment is already cancelled');
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.cancellationReason || '';
    await appointment.save();

    const populated = await populatedAppointment(appointment._id);

    return api.sendSuccess(res, {
      message: 'Appointment cancelled successfully',
      data: { appointment: populated },
    });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/appointments/:id/reschedule — patient owner only. */
async function rescheduleAppointment(req, res, next) {
  try {
    const body = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      throw new api.ApiError(404, 'Appointment not found');
    }

    if (String(appointment.patient) !== String(req.user._id)) {
      throw new api.ApiError(
        403,
        'You are not allowed to reschedule this appointment'
      );
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      const message = `A ${appointment.status} appointment cannot be rescheduled`;
      throw new api.ApiError(409, message);
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor || !doctor.isActive) {
      throw new api.ApiError(409, 'Doctor is not available for rescheduling');
    }

    if (doctor.availableSlots.indexOf(body.time) === -1) {
      const message = `Time ${body.time} is not an available slot for this doctor`;
      throw new api.ApiError(400, message);
    }

    // Skip this same appointment when looking for a conflicting booking.
    const conflict = await Appointment.findActiveConflict(
      appointment.doctor,
      body.date,
      body.time,
      appointment._id
    );
    if (conflict) {
      throw new api.ApiError(409, 'This appointment slot is already booked');
    }

    appointment.date = body.date;
    appointment.time = body.time;
    await appointment.save();

    const populated = await populatedAppointment(appointment._id);

    return api.sendSuccess(res, {
      message: 'Appointment rescheduled successfully',
      data: { appointment: populated },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new api.ApiError(409, 'This appointment slot is already booked'));
    }
    return next(error);
  }
}

module.exports = { cancelAppointment, rescheduleAppointment };
