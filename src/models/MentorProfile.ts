import mongoose from 'mongoose';

const MentorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    skills: {
        type: [String],
        required: true,
        default: []
    },
    experienceTitle: {
        type: String,
        required: true
    },
    experienceYears: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true, // Crucial for TF-IDF Text matching
    },
    pricing: {
        type: Number,
        default: 0 // Free for pre-mentors, paid for pro-mentors
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    availability: [{
        day: String, // e.g., 'Monday'
        slots: [String] // e.g., ['10:00 AM', '02:00 PM']
    }],
    profilePicture: {
        type: String, // URL to profile picture
        default: null
    },
    // Earnings tracking
    totalEarnings: {
        type: Number,
        default: 0
    },
    earningsHistory: [{
        sessionId: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'completed', 'withdrawn'], default: 'pending' }
    }]
}, { timestamps: true });

// Add text index to description and skills for fast querying and basic full-text search fallback.
MentorProfileSchema.index({ description: 'text', skills: 'text' });

export default mongoose.models.MentorProfile || mongoose.model('MentorProfile', MentorProfileSchema);
