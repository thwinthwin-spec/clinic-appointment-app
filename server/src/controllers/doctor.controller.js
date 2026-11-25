/** Public doctor catalogue controllers. Admin writes live in the companion file. */
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const api = require('../utils/apiResponse');
const slots = require('../utils/slots');

/** Turn the isActive query value into a filter value (or undefined for all). */
function activeFilter(value) {
  const text = String(value || '').toLowerCase();

  if (text === 'all') return 'all';
  if (text === 'false') return false;
  return true;
}

/** GET /api/doctors */
async function listDoctors(req, res, next) {
  try {
    const pageInfo = api.getPagination(req.query, 10, 50);
    const filter = {};

    const isActive = activeFilter(req.query.isActive);
    if (isActive !== 'all') {
      filter.isActive = isActive;
    }

    if (req.query.specialty) {
      const escaped = slots.escapeRegex(req.query.specialty);
      filter.specialty = new RegExp(`^${escaped}$`, 'i');
    }

    if (req.query.search) {
      const pattern = new RegExp(slots.escapeRegex(req.query.search), 'i');
      filter.$or = [{ name: pattern }, { specialty: pattern }];
    }

    // Step 1: load one page. Step 2: count everything for pagination.
    const items = await Doctor.find(filter)
      .sort({ createdAt: -1 })
      .skip(pageInfo.skip)
      .limit(pageInfo.limit);

    const total = await Doctor.countDocuments(filter);

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

/** Count distinct configured slots without using a Set. */
function countConfiguredSlots(doctor) {
  const unique = [];

  if (!Array.isArray(doctor.availableSlots)) return 0;

  for (let i = 0; i < doctor.availableSlots.length; i += 1) {
    const slot = doctor.availableSlots[i];
    if (unique.indexOf(slot) === -1) {
      unique.push(slot);
    }
  }

  return unique.length;
}

/** GET /api/doctors/:id — profile plus today's open slot count. */
async function getDoctorById(req, res, next) {
  try {
    const doctor = await Doctor.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!doctor) {
      throw new api.ApiError(404, 'Doctor not found');
    }

    const today = slots.todayDateString();

    const bookedCount = await Appointment.countDocuments({
      doctor: doctor._id,
      date: today,
      status: { $in: slots.ACTIVE_STATUSES },
    });

    const configured = countConfiguredSlots(doctor);
    const availableSlotCount = Math.max(0, configured - bookedCount);

    return api.sendSuccess(res, {
      message: 'Doctor profile retrieved',
      data: { doctor: doctor, availableSlotCount: availableSlotCount },
    });
  } catch (error) {
    return next(error);
  }
}

/** GET /api/doctors/:id/slots?date=YYYY-MM-DD */
async function getDoctorSlots(req, res, next) {
  try {
    const doctor = await Doctor.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!doctor) {
      throw new api.ApiError(404, 'Doctor not found');
    }

    const date = req.query.date;

    const appointments = await Appointment.find({
      doctor: doctor._id,
      date: date,
      status: { $in: slots.ACTIVE_STATUSES },
    }).select('time status');

    const booked = slots.getBookedTimes(appointments);
    const configured = doctor.availableSlots;
    let available = [];

    if (Array.isArray(configured) && configured.length > 0) {
      available = configured;
    } else {
      available = slots.DEFAULT_SLOTS;
    }

    const open = [];
    for (let i = 0; i < available.length; i += 1) {
      const slot = available[i];

      if (booked.indexOf(slot) === -1 && open.indexOf(slot) === -1) {
        open.push(slot);
      }
    }

    return api.sendSuccess(res, {
      message: 'Slots retrieved',
      data: { date: date, booked: booked, available: open },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listDoctors, getDoctorById, getDoctorSlots };
