import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Hackathon pre-registrations.
//
// Phase 1 is free, so there is no payment sub-document at all — no transaction
// ID, no screenshot, and none of the partial-index care the paid events need.
// The ৳2,000 belongs to final registration, a separate flow for the
// shortlisted teams.
//
// One or two members. The owner's spec makes the second optional, so the
// array validator allows 1 and caps at 2 rather than requiring both.
// ---------------------------------------------------------------------------

const memberSchema = new mongoose.Schema(
  {
    /* Row zero. Stored rather than inferred from position, so a mailer can
       query it instead of trusting that nothing ever reorders the array. */
    isTeamLeader: { type: Boolean, default: false },
    fullName: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Member email is required'],
      trim: true,
      lowercase: true,
      maxlength: [120, 'Email cannot exceed 120 characters'],
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    universityName: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
      maxlength: [150, 'University name cannot exceed 150 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    tshirtSize: {
      type: String,
      required: [true, 'T-shirt size is required'],
      trim: true,
    },
    /* Reference, not bytes — src/server/uploads/photo.js explains why, and why
       a photo outlives a payment screenshot. */
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParticipantPhoto',
      default: null,
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
        validator: (val) => Array.isArray(val) && val.length >= 1 && val.length <= 2,
        message: 'A team must have 1 or 2 members',
      },
    },
    /* Every member email, flattened and lower-cased. "Is this person already
       on a team" is an $in against an array field, which the nested members
       path does not answer cheaply. */
    memberEmails: { type: [String], default: [], index: true },

    /* Phase 1 is free, so there is nothing to verify yet. This turns true when
       the team pays at final registration in August. */
    finalRegistered: { type: Boolean, default: false },
    /* Set when a team is picked for the on-site finale. */
    shortlisted: { type: Boolean, default: false },

    registrationStatus: {
      type: String,
      enum: ['pre-registered', 'payment-submitted', 'paid', 'rejected'],
      default: 'pre-registered',
    },

    payment: {
      method: { type: String, trim: true },
      transactionId: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: [25, 'Transaction ID cannot exceed 25 characters'],
      },
      receiverNumber: { type: String, trim: true },
      amount: { type: Number, min: 0 },
      submittedAt: { type: Date },
    },
    verifiedAt: { type: Date },

    agreements: {
      infoCorrect: { type: Boolean, default: false },
      rules: { type: Boolean, default: false },
    },

    registrationId: { type: String, unique: true, trim: true },
  },
  { timestamps: true }
);

registrationSchema.index(
  { 'payment.transactionId': 1 },
  {
    unique: true,
    partialFilterExpression: { 'payment.transactionId': { $type: 'string' } },
  }
);

export default mongoose.models.HackathonRegistration ||
  mongoose.model('HackathonRegistration', registrationSchema, 'hackathon_reg');
