import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
  {
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
      maxlength: [40, 'Student ID cannot exceed 40 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    events: {
      type: [String],
      required: [true, 'At least one event must be selected'],
      validate: [
        (v) => Array.isArray(v) && v.length > 0,
        'At least one event must be selected',
      ],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
      default: '',
    },
    tShirtSize: {
      type: String,
      trim: true,
      enum: ['S', 'M', 'L', 'XL', 'XXL', ''],
      default: '',
    },
    preferredRole: {
      type: String,
      trim: true,
      maxlength: [100, 'Preferred role cannot exceed 100 characters'],
      default: '',
    },
    registrationId: {
      type: String,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.VolunteerRegistration ||
  mongoose.model('VolunteerRegistration', volunteerSchema, 'volunteer');
