import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  sessionId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  revieweeId: mongoose.Types.ObjectId;
  content: string;
  isPublic: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  createdAt: Date;
}

const TestimonialSchema: Schema = new Schema({
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
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
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
}, {
  timestamps: true
});

// Indexes for efficient testimonial queries
TestimonialSchema.index({ revieweeId: 1, isPublic: 1, createdAt: -1 });
TestimonialSchema.index({ isFeatured: 1, createdAt: -1 });

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
