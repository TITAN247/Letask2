import mongoose, { Schema } from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this user.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email for this user.'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password for this user.'],
        minlength: [8, 'Password must be at least 8 characters long.'],
    },
    role: {
        type: String,
        enum: ['mentee', 'prementor', 'promentor', 'admin'],
        required: [true, 'Please provide a role for this user.'],
    },
    onboarding: {
        currentStatus: {
            type: String,
        },
        techSpecialization: {
            type: String,
        },
        experienceLevel: {
            type: String,
        },
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationCode: {
        type: String
    },
    verificationCodeExpiry: {
        type: Date
    },
    resetPasswordCode: {
        type: String
    },
    resetPasswordCodeExpiry: {
        type: Date
    },
    // XP and Level System for Pre-Mentors
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    badges: [{
        type: String
    }],
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    streakDays: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: null
    },
    canApplyForProMentor: {
        type: Boolean,
        default: false
    },
    // Earnings and Ratings for Mentors
    earningsBalance: {
        type: Number,
        default: 0
    },
    totalEarned: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    categoryAverages: {
        communication: { type: Number, default: 0 },
        expertise: { type: Number, default: 0 },
        punctuality: { type: Number, default: 0 },
        helpfulness: { type: Number, default: 0 }
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    // Referral System
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referralCount: {
        type: Number,
        default: 0
    },
    referralCredits: {
        type: Number,
        default: 0
    },
    referredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Profile enhancements
    profilePicture: {
        type: String, // URL to profile picture
        default: null
    },
    avatar: {
        type: String, // Base64 or URL for avatar from onboarding
        default: null
    },
    bio: {
        type: String,
        maxlength: 600
    },
    country: {
        type: String
    },
    timezone: {
        type: String
    },
    hourlyRateINR: {
        type: Number,
        default: 0
    },
    hourlyRateUSD: {
        type: Number,
        default: 0
    },
    linkedInUrl: {
        type: String
    },
    githubUrl: {
        type: String
    },
    portfolioUrl: {
        type: String
    },
    languages: [{
        type: String
    }],
    specializations: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Disable strict mode to allow flexible field updates
UserSchema.set('strict', false);

export default mongoose.models.User || mongoose.model('User', UserSchema);
