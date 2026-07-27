import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Payment screenshots, in their own collection.
//
// Deliberately NOT a field on the registration document. The admin dashboard
// route runs `find({}).lean()` with no projection, so a base64 image on the
// registration row would be shipped to the browser on every dashboard load —
// a hundred registrations would be a hundred photos over mobile data.
//
// `select: false` on the bytes is the second guard: even a query against this
// collection has to ask for `data` explicitly, so a future find() cannot leak
// them by accident.
//
// Not the filesystem: the Dockerfile copies public/ as root and then drops to
// USER nextjs, so the app cannot write there, and `output: 'standalone'` means
// the next build discards the container anyway.
//
// RETENTION: a screenshot exists to prove a payment. Once an admin has checked
// it and set paid: true, it has done its job, and keeping students' financial
// documents past that point is a liability with no upside. dropScreenshot() is
// called at that moment — see src/server/payments/index.js.
// ---------------------------------------------------------------------------

const screenshotSchema = new mongoose.Schema(
  {
    /* Which registration flow this belongs to — 'it-quiz', 'gaming:ludo'.
       Scoped rather than a single global list so a purge can target one event. */
    scope: { type: String, required: true, index: true },

    /* Set once the registration row exists. Null between upload and insert,
       which is what makes orphan cleanup possible. */
    registrationId: { type: String, default: null, index: true },

    data: { type: Buffer, required: true, select: false },
    contentType: { type: String, required: true },
    bytes: { type: Number, required: true },
    originalName: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

export const PaymentScreenshot =
  mongoose.models.PaymentScreenshot ||
  mongoose.model('PaymentScreenshot', screenshotSchema, 'payment_screenshots');
