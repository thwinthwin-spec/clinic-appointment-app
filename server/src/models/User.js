/**
 * User model.
 * Passwords are hashed with bcryptjs and are never returned as JSON.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Login asks for it explicitly with select('+password').
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'admin'],
        message: 'Role must be patient or admin',
      },
      default: 'patient',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
  },
  { timestamps: true }
);

// Hash the password when it is new or when it was changed.
userSchema.pre('save', async function hashPassword(next) {
  try {
    const changed = this.isModified('password');

    if (!changed) {
      next();
      return;
    }

    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

/** Compare a plain-text password with the stored hash. */
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  try {
    if (!this.password) return false;
    if (typeof candidate !== 'string') return false;

    const matches = await bcrypt.compare(candidate, this.password);
    return matches;
  } catch (error) {
    return false;
  }
};

/** Remove the password field from JSON output. */
userSchema.methods.toJSON = function toJSON() {
  const object = this.toObject();
  delete object.password;
  return object;
};

module.exports = mongoose.model('User', userSchema);
