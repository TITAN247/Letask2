import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  reviewerRole: 'mentee' | 'pre-mentor';
  revieweeId: mongoose.Types.ObjectId;
  revieweeRole: 'pre-mentor' | 'pro-mentor';
  sessionId: mongoose.Types.ObjectId;
  overallRating: number;
  categories: {
    communication: number;
    expertise: number;
    punctuality: number;
    helpfulness: number;
  };
  writtenFeedback: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reviewerRole: {
    type: String,
    enum: ['mentee', 'pre-mentor'],
    required: true
  },
  revieweeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  revieweeRole: {
    type: String,
    enum: ['pre-mentor', 'pro-mentor'],
    required: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true,
    index: true
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  categories: {
    communication: { type: Number, min: 1, max: 5, required: true },
    expertise: { type: Number, min: 1, max: 5, required: true },
    punctuality: { type: Number, min: 1, max: 5, required: true },
    helpfulness: { type: Number, min: 1, max: 5, required: true }
  },
  writtenFeedback: {
    type: String,
    maxlength: 300
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
ReviewSchema.index({ reviewerId: 1, sessionId: 1 }, { unique: true });
ReviewSchema.index({ revieweeId: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
