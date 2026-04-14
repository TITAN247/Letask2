import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    menteeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Can reference either User (for Pro-Mentors) or PreMentorApplication (for Pre-Mentors)
    },
    mentorType: {
        type: String,
        enum: ['promentor', 'prementor'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    timeSlot: {
        type: String, // e.g., "10:00 AM"
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed', 'cancelled', 'chat_requested', 'chat_active'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'free'],
        default: 'pending'
    },
    amount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    meetingLink: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: '' // Notes left by the mentee when booking
    },
    sessionNotes: {
        whatWasCovered: { type: String, default: '' },
        actionItems: { type: String, default: '' },
        resourcesShared: { type: String, default: '' },
        nextSessionPlan: { type: String, default: '' },
        aiSummary: { type: String, default: '' }
    },
    isVeryHelpful: {
        type: Boolean,
        default: false
    },
    mentorRated: {
        type: Boolean,
        default: false
    },
    menteeRated: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    chatRequestedAt: {
        type: Date,
        default: null
    },
    chatStartedAt: {
        type: Date,
        default: null
    },
    // User presence tracking
    mentorJoinedAt: {
        type: Date,
        default: null
    },
    menteeJoinedAt: {
        type: Date,
        default: null
    },
    mentorJoined: {
        type: Boolean,
        default: false
    },
    menteeJoined: {
        type: Boolean,
        default: false
    },
    // Session timer fields
    sessionStartedAt: {
        type: Date,
        default: null
    },
    sessionEndedAt: {
        type: Date,
        default: null
    },
    sessionDurationMinutes: {
        type: Number,
        default: 15 // Default 15 min session limit
    },
    endedBy: {
        type: String,
        enum: ['mentee', 'mentor', 'system_timeout', null],
        default: null
    },
    endedReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
