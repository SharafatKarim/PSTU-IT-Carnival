import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    /* The first member is the team leader, and correspondence goes to them
       alone rather than to all three — one mail per team instead of three
       keeps us inside the sending quota.
       Stored explicitly rather than inferred from position: a mailer should be
       able to query `members.isTeamLeader` instead of trusting that nothing
       ever reorders the array. The API sets it from the index, so a submitted
       payload cannot nominate two leaders. */
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
      enum: [
        'pre-registered',
        /* The team says it has paid and gave a transaction ID. That is a claim,
           not proof — anyone can type a plausible reference — so it sits here
           until a human matches it against the wallet statement. */
        'payment-submitted',
        'paid',
        'rejected',
        'pending',
        'approved',
      ],
      default: 'pre-registered',
    },
    /* Set when a team submits its entry fee. Absent until then.

       Everything here except the transaction ID is written server-side: the
       amount from IUPC_PAYMENT, the receiving number as it stood at the time.
       An entrant can claim any figure and any destination, so neither is taken
       from the request — the only thing the team supplies is the reference. */
    payment: {
      method: { type: String, trim: true },
      /* Uppercased on the way in so a duplicate check cannot be defeated by
         typing the same reference in lower case. */
      transactionId: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: [25, 'Transaction ID cannot exceed 25 characters'],
      },
      /* Copied rather than looked up later: the wallet can change, and a
         payment must stay reconcilable against the number that was on screen. */
      receiverNumber: { type: String, trim: true },
      amount: { type: Number, min: 0 },
      submittedAt: { type: Date },
    },
    /* When an admin matched the transaction against the statement. */
    verifiedAt: { type: Date },
    /* When the "final registration is open" mail went to this team's leader
       FROM THE PANEL, one team at a time. Stored rather than kept in the
       panel's memory so the green button survives a reload.

       It is not a record of every announcement a team received: the list goes
       out from a mail client, and this field knows nothing about that. Absent
       means "the panel has not sent one", not "nobody has been told" — the
       bulk sweep that once wrote it in batches set it for teams whose mail
       never arrived, which is why that sweep is gone and the stamps it left
       were cleared (scripts/clear-iupc-notified.mjs). */
    paymentNotifiedAt: { type: Date },
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

/* A transaction ID identifies one real transfer, so no two teams may quote the
   same one. Unique at the database as well as checked in the route: the check
   gives a readable message, this closes the race between two submissions
   quoting the same reference at once. Partial so the teams that have not paid
   do not all collide on a missing field. */
registrationSchema.index(
  { 'payment.transactionId': 1 },
  {
    unique: true,
    partialFilterExpression: { 'payment.transactionId': { $type: 'string' } },
  }
);

export default mongoose.models.Registration || mongoose.model('Registration', registrationSchema, 'IUPC_pre_reg');
