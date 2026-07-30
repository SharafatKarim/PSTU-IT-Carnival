import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    isTeamLeader: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [100, 'Member name cannot exceed 100 characters'],
    },
    universityName: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    universityId: {
      type: String,
      required: [true, 'University ID is required'],
      trim: true,
      maxlength: [50, 'University ID cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Member phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Team name must be at least 3 characters'],
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: function (val) {
          return val.length >= 1 && val.length <= 3;
        },
        message: 'A team must have 1 to 3 members',
      },
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    registrationId: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ProjectShowcaseRegistration ||
  mongoose.model('ProjectShowcaseRegistration', registrationSchema, 'project_showcase_reg');
