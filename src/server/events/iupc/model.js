import mongoose from 'mongoose';

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
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
      maxlength: [50, 'Student ID cannot exceed 50 characters'],
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
    /* Lifecycle: every team lands as 'pre-registered'. When final registration
       opens and a team pays the entry fee, it moves to 'paid'. 'rejected' is
       for withdrawn or disqualified entries.
       Legacy rows may still hold 'pending'/'approved' from before this
       vocabulary existed — see normaliseStatus in ./teams.js, which maps them
       for display. Keep them accepted here so an old row can still be saved. */
    registrationStatus: {
      type: String,
      enum: ['pre-registered', 'paid', 'rejected', 'pending', 'approved'],
      default: 'pre-registered',
    },
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Registration || mongoose.model('Registration', registrationSchema, 'IUPC_pre_reg');
