/**
 * Appointment model.
 *
 * The partial unique index below is important: it stops two active bookings
 * (pending, confirmed or completed) from using the same doctor/date/time.
 * Cancelled appointments are outside the index, so they free the slot.
 * MongoDB partial indexes cannot use $ne, so $in is used instead.
 */
const mongoose = require('mongoose');
const slots = require('../utils/slots');

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      validate: {
        validator: function validDate(value) {
          return slots.isValidDateString(value);
        },
        message: 'Date must be a real calendar date in YYYY-MM-DD format',
      },
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      match: [slots.TIME_PATTERN, 'Time must be in HH:mm format'],
    },
    reason: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'completed'],
        message: 'Status must be pending, confirmed, cancelled or completed',
      },
      default: 'pending',
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Cancellation reason cannot exceed 300 characters'],
    },
  },
  { timestamps: true }
);

// Only active bookings are protected from duplicates.
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  {
    unique: true,
    name: 'uniq_active_doctor_date_time',
    partialFilterExpression: { status: { $in: slots.ACTIVE_STATUSES } },
  }
);

// Indexes for the most common list queries.
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

/** Find an active booking for a doctor/date/time, optionally skipping one id. */
appointmentSchema.statics.findActiveConflict = function findActiveConflict(
  doctor,
  date,
  time,
  excludeId
) {
  const query = {
    doctor: doctor,
    date: date,
    time: time,
    status: { $in: slots.ACTIVE_STATUSES },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

module.exports = mongoose.model('Appointment', appointmentSchema);
