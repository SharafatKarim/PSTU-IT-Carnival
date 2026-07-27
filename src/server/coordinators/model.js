import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Coordinator contacts.
//
// These live in the database rather than in src/data/ so a phone number or an
// email can be corrected without a code change and a redeploy — the people
// answering these lines change between events, and a stale number on a live
// registration page is the one thing on the site nobody can work around.
//
// `scope` is how a row finds its page:
//
//   'pubg-mobile' | 'free-fire' | 'efootball'   one game only
//   'gaming'                                     every game that has no row of
//                                                its own — the wing-wide desk
//   'iupc' | 'datathon' | ...                    reserved; those pages still
//                                                read src/data/events.js today
//
// Seed or edit with scripts/seed-coordinators.mjs, or directly:
//
//   db.coordinators.updateOne(
//     { scope: 'gaming' },
//     { $set: { phone: '01XXXXXXXXX', email: 'someone@cse.pstu.ac.bd' } }
//   )
// ---------------------------------------------------------------------------

const coordinatorSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      required: [true, 'Coordinator scope is required'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Coordinator name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      trim: true,
      maxlength: [150, 'Role cannot exceed 150 characters'],
      default: '',
    },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    /* Display order within a scope. Ties fall back to name. */
    order: { type: Number, default: 0 },
    /* Soft delete: a coordinator who steps down keeps their row (and their
       history) but stops appearing on the site. */
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

coordinatorSchema.index({ scope: 1, active: 1, order: 1 });

export default mongoose.models.Coordinator ||
  mongoose.model('Coordinator', coordinatorSchema, 'coordinators');
