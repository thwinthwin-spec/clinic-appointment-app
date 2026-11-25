/**
 * Doctor model.
 * availableSlots holds the bookable HH:mm strings.
 * workingHours.days accepts day names (Mon..Sun) or day numbers as strings.
 */
const mongoose = require('mongoose');
const slots = require('../utils/slots');

const Schema = mongoose.Schema;

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
      maxlength: [100, 'Specialty cannot exceed 100 characters'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
      maxlength: [150, 'Qualification cannot exceed 150 characters'],
    },
    experienceYears: {
      type: Number,
      required: [true, 'Experience years is required'],
      min: [0, 'Experience years cannot be negative'],
      max: [80, 'Experience years cannot exceed 80'],
    },
    workingHours: {
      days: {
        type: [
          {
            type: String,
            enum: {
              values: slots.ALLOWED_DAYS,
              message: '{VALUE} is not a valid working day',
            },
          },
        ],
        default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      },
      start: {
        type: String,
        default: '09:00',
        match: [slots.TIME_PATTERN, 'Start time must be HH:mm'],
      },
      end: {
        type: String,
        default: '17:00',
        match: [slots.TIME_PATTERN, 'End time must be HH:mm'],
      },
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: [5, 'Slot duration must be at least 5 minutes'],
      max: [480, 'Slot duration cannot exceed 480 minutes'],
    },
    availableSlots: {
      type: [String],
      default: slots.DEFAULT_SLOTS,
      validate: {
        validator: function hasSlots(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'At least one available slot is required',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
  },
  { timestamps: true }
);

// Check each slot string and the working-hours order before saving.
doctorSchema.pre('validate', function validateSlots(next) {
  try {
    const times = this.availableSlots;

    if (Array.isArray(times)) {
      for (let i = 0; i < times.length; i += 1) {
        if (!slots.TIME_PATTERN.test(times[i])) {
          const message = `Invalid available slot "${times[i]}". Use HH:mm.`;
          next(new Error(message));
          return;
        }
      }
    }

    if (this.workingHours) {
      const start = this.workingHours.start;
      const end = this.workingHours.end;

      if (start && end && start >= end) {
        next(new Error('workingHours.end must be after workingHours.start'));
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

doctorSchema.index({ specialty: 1, isActive: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
