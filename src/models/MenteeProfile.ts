import mongoose from 'mongoose';

const MenteeProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    goals: {
        type: [String],
        default: []
    },
    interests: {
        type: [String],
        default: []
    },
    skillLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    bio: {
        type: String,
        default: ''
    },
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    activityScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.models.MenteeProfile || mongoose.model('MenteeProfile', MenteeProfileSchema);
