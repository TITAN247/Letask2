import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  sessionId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  revieweeId: mongoose.Types.ObjectId;
  reviewerRole: 'mentee' | 'mentor';
  revieweeRole: 'mentee' | 'prementor' | 'promentor';
  categories: {
    communication: number;
    expertise: number;
    punctuality: number;
    helpfulness: number;
    overall: number;
  };
  feedback?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
}

const RatingSchema: Schema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  revieweeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reviewerRole: {
    type: String,
    enum: ['mentee', 'mentor'],
    required: true
  },
  revieweeRole: {
    type: String,
    enum: ['mentee', 'prementor', 'promentor'],
    required: true
  },
  categories: {
    communication: { type: Number, min: 1, max: 5, required: true },
    expertise: { type: Number, min: 1, max: 5, required: true },
    punctuality: { type: Number, min: 1, max: 5, required: true },
    helpfulness: { type: Number, min: 1, max: 5, required: true },
    overall: { type: Number, min: 1, max: 5, required: true }
  },
  feedback: {
    type: String,
    maxlength: 500,
    default: ''
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

// Indexes for rating analytics
RatingSchema.index({ revieweeId: 1, createdAt: -1 });
RatingSchema.index({ revieweeRole: 1, 'categories.overall': -1 });

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);
