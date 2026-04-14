import mongoose from 'mongoose';

const ProMentorApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    tempId: {
        type: String,
        unique: true,
        required: true
    },

    // Basic Details
    currentStatus: {
        type: String,
        enum: ['College Student', 'Recent Graduate', 'Working Professional', 'Preparing For Competitive Exams', 'Freelancer/Entrepreneur', 'Other'],
        required: true
    },
    institutionOrCompany: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    subDomain: {
        type: String,
        default: ''
    },

    // Skills & Experience
    skills: [{
        type: String
    }],
    tools: [{
        type: String
    }],
    experienceMonths: {
        type: Number,
        default: 0
    },
    experienceYears: {
        type: Number,
        default: 0
    },

    // Mentorship Style
    teachingStyle: {
        type: String,
        enum: ['practical', 'theory', 'hybrid'],
        required: true
    },
    availabilityDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    availabilityTime: {
        type: String,
        required: true
    },
    preferredMenteeLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'all'
    },

    // Advanced Questions
    qWhyMentor: {
        type: String,
        required: true
    },
    qProblemSolved: {
        type: String,
        required: true
    },
    qGuideBeginners: {
        type: String,
        required: true
    },
    qDifference: {
        type: String,
        required: true
    },
    qConfidence: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    qHandleDoubts: {
        type: String,
        required: true
    },
    qCommStyle: {
        type: String,
        required: true
    },
    qAchievement: {
        type: String,
        required: true
    },

    // Pro-Mentor Specific
    professionalYears: {
        type: Number,
        required: true
    },
    prevMentoringExp: {
        type: String,
        default: ''
    },
    industryExpertise: [{
        type: String
    }],
    expectedPricing: {
        type: Number,
        required: true
    },
    certifications: [{
        type: String
    }],

    // Video Upload
    videoUrl: {
        type: String,
        required: [true, 'Video introduction is required'],
    },
    videoPublicId: {
        type: String
    },
    videoDuration: {
        type: Number
    },

    // Status & Admin
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    // Documentation for verification
    identityDocument: {
        type: String, // URL to uploaded ID proof
        required: false
    },
    identityDocumentType: {
        type: String,
        enum: ['aadhar', 'pan', 'passport', 'driving_license', 'other'],
        required: false
    },
    resumeDocument: {
        type: String, // URL to uploaded resume
        required: false
    },
    documentsVerified: {
        type: Boolean,
        default: false
    },
    adminVerificationNotes: {
        type: String,
        required: false
    },
    adminNotes: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.models.ProMentorApplication || mongoose.model('ProMentorApplication', ProMentorApplicationSchema);
