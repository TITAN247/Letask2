const mongoose = require('mongoose');
const path = require('path');

// Load .env.local from src directory (same as the app)
// __dirname is scripts folder, so go up one level then into src
const envPath = path.join(__dirname, '..', 'src', '.env.local');
console.log('Loading .env.local from:', envPath);
require('dotenv').config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;
console.log('MONGODB_URI exists:', !!MONGODB_URI);

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('   Make sure .env.local exists in src folder with MONGODB_URI');
    process.exit(1);
}

// Connect to MongoDB (same as the API)
const connectDB = async () => {
    try {
        const opts = {
            dbName: 'letask',
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        };
        await mongoose.connect(MONGODB_URI, opts);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📊 Database: letask');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Mock Test Question Schema
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

const MockTestQuestion = mongoose.models.MockTestQuestion || mongoose.model('MockTestQuestion', MockTestQuestionSchema);

const mockQuestions = [
    // Data Science & Machine Learning - MCQs
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is overfitting in machine learning?",
        options: [
            "When a model performs well on training data but poorly on new data",
            "When a model is too simple",
            "When training takes too long",
            "When data is missing"
        ],
        correctOption: 0,
        difficulty: "medium",
        marks: 1,
        explanation: "Overfitting occurs when a model learns the training data too well, including its noise, resulting in poor generalization to new data."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which Python library is commonly used for data manipulation?",
        options: [
            "NumPy",
            "Pandas",
            "Matplotlib",
            "Scikit-learn"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1,
        explanation: "Pandas is a Python library primarily used for data manipulation and analysis."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is the purpose of train-test split in machine learning?",
        options: [
            "To make training faster",
            "To evaluate model performance on unseen data",
            "To reduce memory usage",
            "To create backup data"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1,
        explanation: "Train-test split is used to evaluate model performance on unseen data, helping to detect overfitting and assess generalization."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which metric is commonly used for classification model evaluation?",
        options: [
            "Mean Squared Error",
            "R-squared",
            "Accuracy",
            "Mean Absolute Error"
        ],
        correctOption: 2,
        difficulty: "medium",
        marks: 1,
        explanation: "Accuracy is a common metric for classification models, representing the proportion of correct predictions."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is the difference between supervised and unsupervised learning?",
        options: [
            "Supervised learning uses labeled data, unsupervised uses unlabeled data",
            "Supervised learning is faster than unsupervised",
            "Unsupervised learning requires more data",
            "There is no difference"
        ],
        correctOption: 0,
        difficulty: "easy",
        marks: 1,
        explanation: "Supervised learning uses labeled data with known outputs, while unsupervised learning finds patterns in unlabeled data."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which algorithm is commonly used for regression tasks?",
        options: [
            "K-Means",
            "Decision Tree",
            "Linear Regression",
            "Apriori"
        ],
        correctOption: 2,
        difficulty: "easy",
        marks: 1,
        explanation: "Linear Regression is a fundamental algorithm for regression tasks, predicting continuous values."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is the curse of dimensionality?",
        options: [
            "When data has too many features causing computational issues",
            "When data is too small",
            "When models are too complex",
            "When training time is too long"
        ],
        correctOption: 0,
        difficulty: "medium",
        marks: 1,
        explanation: "The curse of dimensionality refers to various phenomena that arise when analyzing and organizing data in high-dimensional spaces."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which technique is used for feature selection?",
        options: [
            "Data augmentation",
            "Cross-validation",
            "Recursive Feature Elimination",
            "Data normalization"
        ],
        correctOption: 2,
        difficulty: "medium",
        marks: 1,
        explanation: "Recursive Feature Elimination (RFE) is a technique used for feature selection by recursively removing features."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is a confusion matrix used for?",
        options: [
            "To store model parameters",
            "To evaluate classification model performance",
            "To normalize data",
            "To handle missing values"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1,
        explanation: "A confusion matrix is used to evaluate the performance of a classification model by showing true positives, false positives, true negatives, and false negatives."
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which method is used to handle missing data?",
        options: [
            "Data deletion",
            "Imputation",
            "Data augmentation",
            "All of the above"
        ],
        correctOption: 3,
        difficulty: "easy",
        marks: 1,
        explanation: "Multiple methods can handle missing data including deletion, imputation, and data augmentation depending on the context."
    },

    // Data Science & Machine Learning - Descriptive Questions
    {
        domain: "Data Science & Machine Learning",
        type: "descriptive",
        question: "Explain the bias-variance tradeoff in machine learning and how it affects model performance.",
        difficulty: "hard",
        marks: 5
    },
    {
        domain: "Data Science & Machine Learning",
        type: "descriptive",
        question: "Describe the steps involved in a typical data science project from data collection to deployment.",
        difficulty: "hard",
        marks: 5
    },
    {
        domain: "Data Science & Machine Learning",
        type: "descriptive",
        question: "Compare and contrast supervised, unsupervised, and reinforcement learning. Provide examples of each.",
        difficulty: "hard",
        marks: 5
    },
    {
        domain: "Data Science & Machine Learning",
        type: "descriptive",
        question: "Explain the importance of feature engineering in machine learning and provide examples of common techniques.",
        difficulty: "hard",
        marks: 5
    },
    {
        domain: "Data Science & Machine Learning",
        type: "descriptive",
        question: "Describe how you would handle imbalanced datasets in classification problems.",
        difficulty: "hard",
        marks: 5
    }
];

async function seedMockTestQuestions() {
    try {
        await connectDB();
        
        // Clear existing questions
        await MockTestQuestion.deleteMany({});
        console.log('🗑️ Cleared existing mock test questions');
        
        // Insert new questions
        const result = await MockTestQuestion.insertMany(mockQuestions);
        console.log(`✅ Successfully seeded ${result.length} mock test questions`);
        
        // Count questions by domain
        const domainCounts = await MockTestQuestion.aggregate([
            { $group: { _id: '$domain', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\n📊 Questions by domain:');
        domainCounts.forEach(domain => {
            console.log(`  ${domain._id}: ${domain.count} questions`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding mock test questions:", error);
        process.exit(1);
    }
}

seedMockTestQuestions();
