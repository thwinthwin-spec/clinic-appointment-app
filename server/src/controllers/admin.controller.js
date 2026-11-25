/** Admin-only appointment management and dashboard controllers. */
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const api = require('../utils/apiResponse');
const slots = require('../utils/slots');

const POPULATE_FIELDS = [
  { path: 'doctor', select: 'name specialty' },
  { path: 'patient', select: 'name email phone' },
];

/** GET /api/admin/appointments — filterable, paginated list. */
async function getAppointments(req, res, next) {
  try {
    const pageInfo = api.getPagination(req.query, 10, 100);
    const filter = {};

    // Build the filter one field at a time so it is easy to follow.
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.patient) filter.patient = req.query.patient;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;

    const items = await Appointment.find(filter)
      .populate(POPULATE_FIELDS)
      .sort({ date: 1, time: 1 })
      .skip(pageInfo.skip)
      .limit(pageInfo.limit);

    const total = await Appointment.countDocuments(filter);

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

/** PATCH /api/admin/appointments/:id/status */
async function updateAppointmentStatus(req, res, next) {
  try {
    const status = req.body.status;

    let cancellationReason = req.body.cancellationReason || '';
    if (status === 'cancelled' && !cancellationReason) {
      cancellationReason = 'Cancelled by administrator';
    }
    if (status !== 'cancelled') {
      cancellationReason = '';
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      throw new api.ApiError(404, 'Appointment not found');
    }

    // Reactivating a cancelled booking must not take someone else's slot.
    if (status !== 'cancelled') {
      const conflict = await Appointment.findActiveConflict(
        appointment.doctor,
        appointment.date,
        appointment.time,
        appointment._id
      );
      if (conflict) {
        throw new api.ApiError(409, 'This appointment slot is already booked');
      }
    }

    appointment.status = status;
    appointment.cancellationReason = cancellationReason;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id).populate(
      POPULATE_FIELDS
    );

    return api.sendSuccess(res, {
      message: 'Appointment status updated successfully',
      data: { appointment: populated },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new api.ApiError(409, 'This appointment slot is already booked'));
    }
    return next(error);
  }
}

/** GET /api/admin/dashboard — high-level counts for the admin screen. */
async function dashboard(req, res, next) {
  try {
    const today = slots.todayDateString();
    const currentTime = new Date().toISOString().slice(11, 16);

    const upcomingQuery = {
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { date: { $gt: today } },
        { date: today, time: { $gte: currentTime } },
      ],
    };

    // Each count is a small query. Doing them in order keeps this readable.
    const users = await User.countDocuments({});
    const patients = await User.countDocuments({ role: 'patient' });
    const admins = await User.countDocuments({ role: 'admin' });

    const totalDoctors = await Doctor.countDocuments({});
    const activeDoctors = await Doctor.countDocuments({ isActive: true });
    const inactiveDoctors = await Doctor.countDocuments({ isActive: false });

    const totalAppointments = await Appointment.countDocuments({});
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const confirmed = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });
    const completed = await Appointment.countDocuments({ status: 'completed' });
    const upcoming = await Appointment.countDocuments(upcomingQuery);

    return api.sendSuccess(res, {
      message: 'Dashboard data retrieved',
      data: {
        users: users,
        patients: patients,
        admins: admins,
        doctors: {
          total: totalDoctors,
          active: activeDoctors,
          inactive: inactiveDoctors,
        },
        appointments: {
          total: totalAppointments,
          pending: pending,
          confirmed: confirmed,
          cancelled: cancelled,
          completed: completed,
          upcoming: upcoming,
          activeStatuses: slots.ACTIVE_STATUSES,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAppointments, updateAppointmentStatus, dashboard };
