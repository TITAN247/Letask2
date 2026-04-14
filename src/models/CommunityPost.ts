import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  comments: {
    authorId: mongoose.Types.ObjectId;
    body: string;
    createdAt: Date;
  }[];
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CommunityPostSchema: Schema = new Schema({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    maxlength: 5000
  },
  tags: [{
    type: String
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  isPinned: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
CommunityPostSchema.index({ createdAt: -1 });
CommunityPostSchema.index({ isPinned: -1, createdAt: -1 });
CommunityPostSchema.index({ tags: 1 });

export default mongoose.models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
