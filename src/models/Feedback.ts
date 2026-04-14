import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  sessionId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  fromRole: 'mentee' | 'mentor';
  toRole: 'mentee' | 'prementor' | 'promentor';
  rating: number;
  categories?: {
    communication: number;
    expertise: number;
    punctuality: number;
    helpfulness: number;
  };
  review: string;
  testimonial?: string;
  tags?: string[];
  isPublic: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  menteeId: {
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
  fromRole: {
    type: String,
    enum: ['mentee', 'mentor'],
    required: true
  },
  toRole: {
    type: String,
    enum: ['mentee', 'prementor', 'promentor'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: {
    communication: { type: Number, min: 1, max: 5 },
    expertise: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 }
  },
  review: {
    type: String,
    default: '',
    maxlength: 500
  },
  testimonial: {
    type: String,
    default: '',
    maxlength: 1000
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexes for feedback analytics
FeedbackSchema.index({ mentorId: 1, createdAt: -1 });
FeedbackSchema.index({ isFeatured: 1, createdAt: -1 });
FeedbackSchema.index({ menteeId: 1, sessionId: 1 }, { unique: true });

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
