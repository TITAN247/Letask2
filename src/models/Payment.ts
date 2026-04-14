import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  gateway: 'razorpay' | 'stripe';
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  commissionAmount: number;
  mentorEarning: number;
  // Refund fields
  refundId?: string;
  refundReason?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe'],
    required: true
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  paymentId: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  commissionAmount: {
    type: Number,
    default: 0
  },
  mentorEarning: {
    type: Number,
    default: 0
  },
  refundId: {
    type: String,
    default: null
  },
  refundReason: {
    type: String,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for common queries
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
