import mongoose from 'mongoose';

const UpgradeApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, enum: ['prementor', 'promentor'], required: true },
    tempId: { type: String, unique: true }, // e.g., LAK-1234
    
    // Questionnaire Base
    currentStatus: String,
    domain: String,
    subDomain: String,
    skills: [String],
    tools: [String],
    experienceYears: Number,
    experienceLevel: String, 
    institution: String,     
    location: String,        
    mentorshipStyle: String,
    availability: String,

    // Advanced Behavioral Questions
    qWhyMentor: String,
    qProblemSolved: String,
    qGuideBeginners: String,
    qDifference: String,
    qConfidence: Number,
    qHandleDoubts: String,
    qCommStyle: String,
    qAchievement: String,

    // Pro-Mentor Specific
    professionalYears: Number,
    prevMentoringExp: String,
    expectedPricing: Number,

    // Attachments
    documents: [String],
    videoUrl: String,

    // Test Results
    mockTestScore: Number,
    mockTestAnswers: [
        {
            question: String,
            selectedOption: Number,
            correctOption: Number,
            isCorrect: Boolean
        }
    ],
    descriptiveAnswer: String,

    // Admin Status
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNotes: String
}, { timestamps: true });

export default mongoose.models.UpgradeApplication || mongoose.model('UpgradeApplication', UpgradeApplicationSchema);
