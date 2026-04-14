import mongoose from 'mongoose';

const MockTestQuestionSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: true,
        enum: [
            'Frontend Development',
            'Backend Development',
            'Full Stack Development',
            'Mobile App Development',
            'Data Science & Machine Learning',
            'DevOps & Cloud',
            'Competitive Programming',
            'Game Development',
            'Blockchain Development',
            'Cybersecurity'
        ]
    },
    type: {
        type: String,
        enum: ['mcq', 'descriptive'],
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String
    }],
    correctOption: {
        type: Number,
        default: null
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    marks: {
        type: Number,
        default: 1
    },
    explanation: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.models.MockTestQuestion || mongoose.model('MockTestQuestion', MockTestQuestionSchema);
