import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    /* Both enums must list every value the admin route actually writes.
       A value missing here does not fail quietly: AdminLog.create() rejects,
       the PATCH handler's catch turns that into a 500, and the panel reports
       "Server error" for an approval that already saved — so an admin re-runs
       an action that worked. 'it-quiz' and 'project-showcase' were being
       written without being listed and did exactly that. */
    action: {
      type: String,
      required: true,
      enum: [
        'approve_payment',
        'bulk_approve_payments',
        'iupc_paid_toggle',
        'notify_payment',
        'bulk_notify_payments',
      ],
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'datathon',
        'gaming',
        'iupc',
        'it-quiz',
        'project-showcase',
        'app-challenge',
        'general',
      ],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

export default mongoose.models.AdminLog || mongoose.model('AdminLog', adminLogSchema, 'admin_action_logs');
