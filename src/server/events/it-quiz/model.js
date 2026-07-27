import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// IT Quiz registrations.
//
// Flat, not a members array. IT Quiz is one entrant — wrapping a single person
// in a one-element array with isTeamLeader: true, the way the team events do,
// would be a lie about the shape and every consumer would have to unwrap it.
//
// The important detail is `transactionId`. The datathon schema marks it
// `required: true, unique: true`, which is right when a transaction ID is the
// only proof of payment. Here a screenshot is an accepted alternative, so it is
// optional — and a plain unique index would then let the FIRST screenshot-only
// entrant through and reject the SECOND for a duplicate null. The partial index
// below only covers documents where the field actually exists, so any number of
// screenshot-only registrations coexist.
//
// The normaliser must write `undefined`, never `''`. An empty string exists as
// far as the index is concerned and collides exactly like null would.
// ---------------------------------------------------------------------------

const registrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    /* Optional, by the owner's spec. Someone with no email is contacted on
       WhatsApp, which is why that one is required and this is not. */
    email: {
      type: String,
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
    academicId: {
      type: String,
      required: [true, 'Academic ID is required'],
      trim: true,
      maxlength: [40, 'Academic ID cannot exceed 40 characters'],
    },
    faculty: {
      type: String,
      required: [true, 'Faculty is required'],
      trim: true,
      maxlength: [100, 'Faculty cannot exceed 100 characters'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
      maxlength: [40, 'Semester cannot exceed 40 characters'],
    },
    session: {
      type: String,
      required: [true, 'Session is required'],
      trim: true,
      maxlength: [20, 'Session cannot exceed 20 characters'],
    },

    payment: {
      method: { type: String, trim: true, maxlength: 40 },
      /* Optional on purpose — see the header. */
      transactionId: { type: String, trim: true, maxlength: 25 },
      /* Reference, not bytes. src/server/payments/screenshot.js explains why. */
      screenshot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentScreenshot',
        default: null,
      },
      amount: { type: Number, default: 50 },
      receiverNumber: { type: String, trim: true },
    },

    /* Stored, not just validated. The gaming stack checks its agreement boxes
       and then throws the answer away, so there is no record that anyone
       accepted the rules. If that is ever disputed, this is the evidence. */
    agreements: {
      infoCorrect: { type: Boolean, required: true },
      rules: { type: Boolean, required: true },
    },

    paid: { type: Boolean, default: false },
    registrationId: { type: String, unique: true, trim: true },
  },
  { timestamps: true }
);

/* Partial, not plain: only documents that actually carry a transaction ID are
   indexed, so screenshot-only entries never collide with each other. */
registrationSchema.index(
  { 'payment.transactionId': 1 },
  {
    unique: true,
    partialFilterExpression: {
      'payment.transactionId': { $type: 'string' },
    },
  }
);

export default mongoose.models.ItQuizRegistration ||
  mongoose.model('ItQuizRegistration', registrationSchema, 'it_quiz_reg');
