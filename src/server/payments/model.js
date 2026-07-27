import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Where entrants send the registration fee.
//
// In the database rather than in src/data/ for the same reason coordinator
// contacts are: the receiving wallet changes between events and between the
// people holding it, and a wrong number on a live form means money going to a
// stranger. An admin panel can edit this row; nothing needs a redeploy.
//
// `scope` resolves the same way coordinators do:
//
//   'pubg-mobile' | 'free-fire' | 'efootball'   one tournament only
//   'gaming'                                     every tournament without its
//                                                own row — the wing-wide wallet
//
// The list of ACCEPTED METHODS is deliberately not here — it lives in
// PAYMENT_METHODS in src/data/gaming.js, because the server validates the
// submitted method against it. An admin adding "Tap" here would otherwise be
// offering a method the validator rejects.
//
// Seed or edit with scripts/seed-db.sh, or directly:
//
//   db.payment_accounts.updateOne(
//     { scope: 'gaming' },
//     { $set: { number: '01XXXXXXXXX' } }
//   )
// ---------------------------------------------------------------------------

const paymentAccountSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      required: [true, 'Payment account scope is required'],
      trim: true,
      index: true,
    },
    number: {
      type: String,
      required: [true, 'Receiving number is required'],
      trim: true,
    },
    /* "Personal" or "Merchant" — it changes which option the sender picks in
       their wallet app, so it is shown next to the number. */
    accountType: { type: String, trim: true, default: 'Personal' },
    instructions: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

paymentAccountSchema.index({ scope: 1, active: 1 });

export default mongoose.models.PaymentAccount ||
  mongoose.model('PaymentAccount', paymentAccountSchema, 'payment_accounts');
