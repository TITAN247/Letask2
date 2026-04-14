import mongoose, { Schema, Document } from 'mongoose';

export interface IXPTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  source: string;
  sessionId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const XPTransactionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['session_complete', 'review_5star', 'review_4star', 'very_helpful', 'profile_complete', 'mock_test_pass', 'streak_bonus', 'first_session', 'milestone_10sessions', 'community_post', 'community_upvote', 'referral'],
    required: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  }
}, {
  timestamps: true
});

XPTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.XPTransaction || mongoose.model<IXPTransaction>('XPTransaction', XPTransactionSchema);
