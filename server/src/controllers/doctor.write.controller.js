/** Admin-only doctor create/update/delete controllers. */
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const api = require('../utils/apiResponse');

/** Copy the optional working-hours fields into a plain object. */
function readWorkingHours(body) {
  const hours = {};

  if (body.workingHours.days !== undefined) {
    hours.days = body.workingHours.days;
  }
  if (body.workingHours.start !== undefined) {
    hours.start = body.workingHours.start;
  }
  if (body.workingHours.end !== undefined) {
    hours.end = body.workingHours.end;
  }

  return hours;
}

/** POST /api/doctors — admin only. */
async function createDoctor(req, res, next) {
  try {
    const body = req.body;

    const payload = {
      name: body.name,
      specialty: body.specialty,
      qualification: body.qualification,
      experienceYears: body.experienceYears,
      createdBy: req.user._id,
    };

    if (body.workingHours) {
      payload.workingHours = readWorkingHours(body);
    }
    if (body.slotDurationMinutes !== undefined) {
      payload.slotDurationMinutes = body.slotDurationMinutes;
    }
    if (body.availableSlots !== undefined) {
      payload.availableSlots = body.availableSlots;
    }
    if (body.isActive !== undefined) {
      payload.isActive = body.isActive;
    }

    const doctor = await Doctor.create(payload);

    return api.sendSuccess(res, {
      status: 201,
      message: 'Doctor created successfully',
      data: { doctor: doctor },
    });
  } catch (error) {
    return next(error);
  }
}

/** PUT /api/doctors/:id — admin only. Only supplied fields are changed. */
async function updateDoctor(req, res, next) {
  try {
    const body = req.body;
    const updates = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.specialty !== undefined) updates.specialty = body.specialty;
    if (body.qualification !== undefined) {
      updates.qualification = body.qualification;
    }
    if (body.experienceYears !== undefined) {
      updates.experienceYears = body.experienceYears;
    }
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    if (body.workingHours) {
      if (body.workingHours.days !== undefined) {
        updates['workingHours.days'] = body.workingHours.days;
      }
      if (body.workingHours.start !== undefined) {
        updates['workingHours.start'] = body.workingHours.start;
      }
      if (body.workingHours.end !== undefined) {
        updates['workingHours.end'] = body.workingHours.end;
      }
    }

    if (body.slotDurationMinutes !== undefined) {
      updates.slotDurationMinutes = body.slotDurationMinutes;
    }
    if (body.availableSlots !== undefined) {
      updates.availableSlots = body.availableSlots;
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      throw new api.ApiError(404, 'Doctor not found');
    }

    return api.sendSuccess(res, {
      message: 'Doctor updated successfully',
      data: { doctor: doctor },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/doctors/:id — admin only.
 * Doctors with appointments are deactivated instead of removed.
 */
async function deleteDoctor(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      throw new api.ApiError(404, 'Doctor not found');
    }

    const appointmentCount = await Appointment.countDocuments({
      doctor: doctor._id,
    });

    if (appointmentCount > 0) {
      doctor.isActive = false;
      await doctor.save();

      return api.sendSuccess(res, {
        message:
          'Doctor has existing appointments and was deactivated instead of deleted',
        data: {
          id: doctor._id,
          isActive: false,
          softDeleted: true,
          appointmentCount: appointmentCount,
        },
      });
    }

    await doctor.deleteOne();

    return api.sendSuccess(res, {
      message: 'Doctor deleted successfully',
      data: {
        id: req.params.id,
        deleted: true,
        softDeleted: false,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createDoctor, updateDoctor, deleteDoctor };
