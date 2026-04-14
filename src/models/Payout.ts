import mongoose, { Schema, Document } from 'mongoose';

export interface IPayout extends Document {
  mentorId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  adminNotes: string;
  processedAt: Date;
  createdAt: Date;
}

const PayoutSchema: Schema = new Schema({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
    index: true
  },
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true }
  },
  adminNotes: {
    type: String,
    default: ''
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
PayoutSchema.index({ status: 1, createdAt: -1 });
PayoutSchema.index({ mentorId: 1, createdAt: -1 });

export default mongoose.models.Payout || mongoose.model<IPayout>('Payout', PayoutSchema);
