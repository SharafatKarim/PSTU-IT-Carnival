import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// App Challenge registrations.
//
// Flat schema for individual developer entries in App Challenge.
// Registration is free (sponsored by BDAPPS).
// ---------------------------------------------------------------------------

const registrationSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: [true, "App's name is required"],
      trim: true,
      maxlength: [150, "App's name cannot exceed 150 characters"],
    },
    shortAbstract: {
      type: String,
      required: [true, 'Short abstract is required'],
      trim: true,
      maxlength: [2000, 'Short abstract cannot exceed 2000 characters'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
      maxlength: [50, 'Student ID cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [120, 'Email cannot exceed 120 characters'],
    },
    agreements: {
      infoCorrect: { type: Boolean, required: true },
      rules: { type: Boolean, required: true },
    },
    paid: { type: Boolean, default: true },
    registrationId: { type: String, unique: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.AppChallengeRegistration ||
  mongoose.model('AppChallengeRegistration', registrationSchema, 'app_challenge_reg');
