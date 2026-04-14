import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  docType: 'identity' | 'education' | 'certification' | 'experience' | 'other';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
}

const DocumentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  docType: {
    type: String,
    enum: ['identity', 'education', 'certification', 'experience', 'other'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
DocumentSchema.index({ userId: 1, docType: 1 });
DocumentSchema.index({ status: 1, uploadedAt: -1 });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
