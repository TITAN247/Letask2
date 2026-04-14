
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function diagnose() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const Session = mongoose.models.Session || mongoose.model('Session', new mongoose.Schema({
            menteeId: mongoose.Schema.Types.ObjectId,
            mentorId: mongoose.Schema.Types.ObjectId,
            mentorType: String,
            status: String
        }, { strict: false }));

        const PreMentorApplication = mongoose.models.PreMentorApplication || mongoose.model('PreMentorApplication', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId
        }, { strict: false }));

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
            role: String
        }, { strict: false }));

        const allSessions = await Session.find({}).lean();
        console.log(`Total sessions in DB: ${allSessions.length}`);

        for (const session of allSessions) {
            console.log(`--- Session ${session._id} ---`);
            console.log(`Booked for Mentor ID: ${session.mentorId} (${session.mentorType})`);
            console.log(`Status: ${session.status}`);
            
            // Check if mentorId exists in User collection
            const userMentor = await User.findById(session.mentorId);
            if (userMentor) {
                console.log(`Found in User: ${userMentor.name} (${userMentor.role})`);
            } else {
                // Check if mentorId exists in PreMentorApplication collection
                const appMentor = await PreMentorApplication.findById(session.mentorId);
                if (appMentor) {
                    const mentorUser = await User.findById(appMentor.userId);
                    console.log(`Found in PreMentorApplication: User is ${mentorUser ? mentorUser.name : 'Unknown'}`);
                } else {
                    console.log(`⚠️ mentorId ${session.mentorId} NOT FOUND in User or PreMentorApplication!`);
                }
            }
        }

        // List all PreMentorApplications
        const apps = await PreMentorApplication.find({}).lean();
        console.log(`\nTotal PreMentorApplications: ${apps.length}`);
        for (const app of apps) {
            const u = await User.findById(app.userId);
            console.log(`App ID: ${app._id}, User: ${u ? u.name : 'Unknown'} (${app.userId})`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

diagnose();
