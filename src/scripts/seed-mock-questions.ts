import dbConnect from "@/lib/db";
import MockTestQuestion from "@/models/MockTestQuestion";

const mockQuestions = [
    // Frontend Development - MCQs
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "What is the purpose of the 'key' prop in React lists?",
        options: [
            "To style list items",
            "To help React identify which items have changed, are added, or are removed",
            "To create unique URLs",
            "To encrypt list data"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1,
        explanation: "Keys help React identify which items have changed, are added, or are removed. Keys should be given to the elements inside the array to give the elements a stable identity."
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "Which CSS property is used to change the text color of an element?",
        options: [
            "text-color",
            "font-color",
            "color",
            "text-style"
        ],
        correctOption: 2,
        difficulty: "easy",
        marks: 1,
        explanation: "The 'color' property in CSS is used to set the color of text."
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "What is the virtual DOM in React?",
        options: [
            "A direct copy of the browser's DOM",
            "A lightweight JavaScript representation of the actual DOM",
            "A 3D visualization library",
            "A browser extension for debugging"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1,
        explanation: "The virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to optimize updates by comparing the new virtual DOM with the previous one."
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "Which method is used to fetch data from an API in JavaScript?",
        options: [
            "fetch()",
            "getData()",
            "request()",
            "apiCall()"
        ],
        correctOption: 0,
        difficulty: "easy",
        marks: 1,
        explanation: "The fetch() method is the modern standard for making HTTP requests in JavaScript."
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "What is CSS Flexbox used for?",
        options: [
            "Creating flexible database schemas",
            "One-dimensional layout method for arranging items in rows or columns",
            "Adding animations to elements",
            "Managing JavaScript modules"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1,
        explanation: "CSS Flexbox is a one-dimensional layout method for laying out items in rows or columns. Items flex to fill additional space and shrink to fit into smaller spaces."
    },
    
    // Backend Development - MCQs
    {
        domain: "Backend Development",
        type: "mcq",
        question: "What does REST stand for in REST API?",
        options: [
            "Representational State Transfer",
            "Resource Endpoint State Transfer",
            "Remote Execution State Transfer",
            "Request Endpoint State Transfer"
        ],
        correctOption: 0,
        difficulty: "medium",
        marks: 1,
        explanation: "REST stands for Representational State Transfer. It is an architectural style for designing networked applications."
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "Which HTTP method is used to update a resource?",
        options: [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        correctOption: 2,
        difficulty: "easy",
        marks: 1,
        explanation: "PUT is typically used to update a resource, while POST is used to create a new resource."
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "What is middleware in Express.js?",
        options: [
            "A database connection tool",
            "Functions that have access to the request and response objects",
            "A frontend framework",
            "A CSS preprocessor"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1,
        explanation: "Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application's request-response cycle."
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "What is the purpose of JWT (JSON Web Tokens)?",
        options: [
            "To store images efficiently",
            "To securely transmit information between parties as a JSON object",
            "To compress JavaScript files",
            "To style web pages"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1,
        explanation: "JWT is used to securely transmit information between parties as a JSON object. It's commonly used for authentication and information exchange."
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "Which database is a NoSQL document database?",
        options: [
            "MySQL",
            "PostgreSQL",
            "MongoDB",
            "Oracle"
        ],
        correctOption: 2,
        difficulty: "easy",
        marks: 1,
        explanation: "MongoDB is a NoSQL document database that stores data in JSON-like documents."
    },

    // Descriptive Questions - Frontend
    {
        domain: "Frontend Development",
        type: "descriptive",
        question: "Explain the concept of component lifecycle in React and describe the main phases.",
        difficulty: "hard",
        marks: 5
    },
    {
        domain: "Frontend Development",
        type: "descriptive",
        question: "Compare and contrast CSS Grid and Flexbox. When would you use each?",
        difficulty: "hard",
        marks: 5
    },

    // Descriptive Questions - Backend
    {
        domain: "Backend Development",
        type: "descriptive",
        question: "Explain the concept of database normalization and why it's important.",
        difficulty: "hard",
        marks: 5
    },
    {
        domain: "Backend Development",
        type: "descriptive",
        question: "Describe the difference between synchronous and asynchronous programming in Node.js. Provide examples.",
        difficulty: "hard",
        marks: 5
    },

    // DevOps & Cloud - MCQs
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "What does CI/CD stand for?",
        options: [
            "Cloud Infrastructure/Cloud Deployment",
            "Continuous Integration/Continuous Deployment",
            "Code Integration/Code Deployment",
            "Computer Infrastructure/Computer Deployment"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1,
        explanation: "CI/CD stands for Continuous Integration and Continuous Deployment/Delivery."
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "What is Docker used for?",
        options: [
            "Writing code",
            "Containerizing applications",
            "Managing databases",
            "Creating websites"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1,
        explanation: "Docker is used to containerize applications, packaging them with all their dependencies."
    },

    // AI/ML - MCQs
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
        await dbConnect();
        
        // Clear existing questions
        await MockTestQuestion.deleteMany({});
        
        // Insert new questions
        await MockTestQuestion.insertMany(mockQuestions);
        
        console.log(`✅ Successfully seeded ${mockQuestions.length} mock test questions`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding mock test questions:", error);
        process.exit(1);
    }
}

seedMockTestQuestions();
