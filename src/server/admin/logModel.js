import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['approve_payment', 'bulk_approve_payments', 'iupc_paid_toggle'],
    },
    eventType: {
      type: String,
      required: true,
      enum: ['datathon', 'gaming', 'iupc', 'general'],
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
