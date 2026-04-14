import { NextResponse } from "next/server";
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
        explanation: "Keys help React identify which items have changed, are added, or are removed."
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "Which CSS property is used to change the text color of an element?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctOption: 2,
        difficulty: "easy",
        marks: 1
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
        marks: 1
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "Which HTML5 tag is used to define navigation links?",
        options: ["<nav>", "<navigation>", "<menu>", "<links>"],
        correctOption: 0,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "What does 'responsive design' primarily focus on?",
        options: [
            "Making websites load faster",
            "Adapting layout to different screen sizes",
            "Adding animations",
            "Improving SEO"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "Which method is used to fetch data from an API in modern JavaScript?",
        options: ["getData()", "fetch()", "request()", "ajax()"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "What is the default display property of a <div> element?",
        options: ["inline", "block", "flex", "grid"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Frontend Development",
        type: "mcq",
        question: "Which React hook is used to manage state in functional components?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    // Frontend Development - Descriptive
    {
        domain: "Frontend Development",
        type: "descriptive",
        question: "Explain the concept of React hooks and provide examples of useState and useEffect.",
        difficulty: "medium",
        marks: 5
    },
    {
        domain: "Frontend Development",
        type: "descriptive",
        question: "Describe how you would optimize a web application's performance. List at least 5 techniques.",
        difficulty: "hard",
        marks: 5
    },

    // Backend Development - MCQs
    {
        domain: "Backend Development",
        type: "mcq",
        question: "Which HTTP method is typically used to update a resource?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctOption: 2,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "What is the purpose of JWT (JSON Web Token)?",
        options: [
            "To style web pages",
            "To securely transmit information between parties",
            "To store images",
            "To compress data"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "Which database is a NoSQL document database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
        correctOption: 2,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "What does REST stand for?",
        options: [
            "Remote Execution Service Technology",
            "Representational State Transfer",
            "Responsive External Service Transfer",
            "Real-time Execution Standard"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "Which status code indicates a successful HTTP request?",
        options: ["404", "500", "200", "301"],
        correctOption: 2,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "What is middleware in Express.js?",
        options: [
            "A database",
            "A function that processes requests",
            "A frontend framework",
            "A CSS preprocessor"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "Which is used for caching in web applications?",
        options: ["Redis", "React", "Bootstrap", "jQuery"],
        correctOption: 0,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Backend Development",
        type: "mcq",
        question: "What is the purpose of environment variables?",
        options: [
            "To style the application",
            "To store sensitive configuration data",
            "To create UI components",
            "To handle user authentication"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    // Backend Development - Descriptive
    {
        domain: "Backend Development",
        type: "descriptive",
        question: "Explain the difference between SQL and NoSQL databases, and when to use each.",
        difficulty: "medium",
        marks: 5
    },
    {
        domain: "Backend Development",
        type: "descriptive",
        question: "Describe how you would implement authentication and authorization in a web application.",
        difficulty: "hard",
        marks: 5
    },

    // Mobile App Development - MCQs
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "Which framework uses Dart programming language?",
        options: ["React Native", "Flutter", "SwiftUI", "Kotlin"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "What is the purpose of AsyncStorage in React Native?",
        options: [
            "To store data locally on the device",
            "To make API calls",
            "To style components",
            "To handle navigation"
        ],
        correctOption: 0,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "Which platform uses Swift as its primary language?",
        options: ["Android", "iOS", "Windows", "Linux"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "What is hot reload in mobile development?",
        options: [
            "A battery saving feature",
            "A feature that updates code without restarting the app",
            "A camera feature",
            "A network optimization"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "Which file format is used for Android app distribution?",
        options: [".ipa", ".apk", ".exe", ".dmg"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "What is the purpose of Firebase in mobile apps?",
        options: [
            "A game engine",
            "A backend-as-a-service platform",
            "A photo editor",
            "An email client"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "Which lifecycle method is called when a React Native component mounts?",
        options: ["componentWillUnmount", "componentDidMount", "render", "constructor"],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Mobile App Development",
        type: "mcq",
        question: "What is the purpose of Push Notifications?",
        options: [
            "To send data to server",
            "To alert users even when app is closed",
            "To style the UI",
            "To compress images"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    // Mobile App Development - Descriptive
    {
        domain: "Mobile App Development",
        type: "descriptive",
        question: "Explain the differences between native development and cross-platform development. List pros and cons of each.",
        difficulty: "medium",
        marks: 5
    },
    {
        domain: "Mobile App Development",
        type: "descriptive",
        question: "Describe how you would handle state management in a large-scale React Native application.",
        difficulty: "hard",
        marks: 5
    },

    // Data Science & Machine Learning - MCQs
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which Python library is primarily used for data manipulation?",
        options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is the purpose of machine learning?",
        options: [
            "To create websites",
            "To enable computers to learn from data",
            "To design databases",
            "To write documentation"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which type of ML algorithm is used for predicting continuous values?",
        options: ["Classification", "Clustering", "Regression", "Association"],
        correctOption: 2,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What does CSV stand for?",
        options: [
            "Computer System Value",
            "Comma Separated Values",
            "Common Statistical Variable",
            "Calculated Sum Value"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which visualization library creates interactive plots?",
        options: ["Matplotlib", "Seaborn", "Plotly", "NumPy"],
        correctOption: 2,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is overfitting in machine learning?",
        options: [
            "Model performs well on training data but poorly on new data",
            "Model performs poorly on all data",
            "Model is too simple",
            "Model uses too little data"
        ],
        correctOption: 0,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "Which metric measures classification accuracy?",
        options: ["Mean Squared Error", "R-squared", "Accuracy Score", "P-value"],
        correctOption: 2,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "Data Science & Machine Learning",
        type: "mcq",
        question: "What is the purpose of feature scaling?",
        options: [
            "To add more features",
            "To normalize feature values to similar ranges",
            "To remove features",
            "To rename features"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    // Data Science & Machine Learning - Descriptive
    {
        domain: "Data Science & Machine Learning",
        type: "descriptive",
        question: "Explain the CRISP-DM methodology and its phases in data science projects.",
        difficulty: "medium",
        marks: 5
    },
    {
        domain: "Data Science & Machine Learning",
        type: "descriptive",
        question: "Describe the bias-variance tradeoff in machine learning and techniques to handle it.",
        difficulty: "hard",
        marks: 5
    },

    // DevOps & Cloud - MCQs
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "What does CI/CD stand for?",
        options: [
            "Computer Integration / Computer Deployment",
            "Continuous Integration / Continuous Deployment",
            "Code Integration / Code Development",
            "Cloud Integration / Cloud Deployment"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "Which AWS service is used for serverless computing?",
        options: ["EC2", "Lambda", "S3", "RDS"],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "What is Docker used for?",
        options: [
            "Database management",
            "Containerization of applications",
            "Frontend development",
            "Machine learning"
        ],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "Which tool is used for container orchestration?",
        options: ["Docker", "Kubernetes", "Jenkins", "Git"],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "What is the purpose of Terraform?",
        options: [
            "Infrastructure as Code",
            "Frontend framework",
            "Database management",
            "Code editor"
        ],
        correctOption: 0,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "Which command is used to list running Docker containers?",
        options: ["docker ps", "docker list", "docker show", "docker running"],
        correctOption: 0,
        difficulty: "easy",
        marks: 1
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "What is a load balancer used for?",
        options: [
            "Storing data",
            "Distributing traffic across multiple servers",
            "Encrypting data",
            "Caching content"
        ],
        correctOption: 1,
        difficulty: "medium",
        marks: 1
    },
    {
        domain: "DevOps & Cloud",
        type: "mcq",
        question: "Which version control system is most widely used?",
        options: ["SVN", "Git", "Mercurial", "CVS"],
        correctOption: 1,
        difficulty: "easy",
        marks: 1
    },
    // DevOps & Cloud - Descriptive
    {
        domain: "DevOps & Cloud",
        type: "descriptive",
        question: "Explain the concept of Infrastructure as Code (IaC) and its benefits.",
        difficulty: "medium",
        marks: 5
    },
    {
        domain: "DevOps & Cloud",
        type: "descriptive",
        question: "Describe the differences between monolithic and microservices architecture. When would you choose one over the other?",
        difficulty: "hard",
        marks: 5
    }
];

async function seedDatabase() {
    await dbConnect();
    await MockTestQuestion.deleteMany({});
    await MockTestQuestion.insertMany(mockQuestions);
    return { count: mockQuestions.length };
}

// GET - Also allow seeding via browser (for convenience)
export async function GET() {
    try {
        const result = await seedDatabase();
        return NextResponse.json({
            message: "Mock test questions seeded successfully",
            ...result
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed questions", error: String(error) },
            { status: 500 }
        );
    }
}

// POST - Seed via API
export async function POST() {
    try {
        const result = await seedDatabase();
        return NextResponse.json({
            message: "Mock test questions seeded successfully",
            ...result
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed questions", error: String(error) },
            { status: 500 }
        );
    }
}
