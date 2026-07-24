const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [100, 'Member name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Member email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Member phone is required'],
      trim: true,
    },
    codeforcesHandle: {
      type: String,
      required: [true, 'Codeforces handle is required'],
      trim: true,
      maxlength: [50, 'Codeforces handle cannot exceed 50 characters'],
    },
    tshirtSize: {
      type: String,
      required: [true, 'T-shirt size is required'],
      enum: {
        values: ['S', 'M', 'L', 'XL', 'XXL'],
        message: 'T-shirt size must be one of S, M, L, XL, XXL',
      },
    },
  },
  { _id: false }
);

const coachSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Coach name is required'],
      trim: true,
      maxlength: [100, 'Coach name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Coach email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Coach phone is required'],
      trim: true,
    },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [3, 'Team name must be at least 3 characters'],
      maxlength: [100, 'Team name cannot exceed 100 characters'],
      unique: true,
    },
    varsityName: {
      type: String,
      required: [true, 'Varsity name is required'],
      trim: true,
      maxlength: [150, 'Varsity name cannot exceed 150 characters'],
    },
    coach: {
      type: coachSchema,
      required: true,
    },
    members: {
      type: [memberSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 3,
        message: 'A team must have exactly 3 members',
      },
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
