
const mongoose = require('mongoose');

async function diagnose() {
    const MONGODB_URI = "mongodb://shivansh0962_db_user:kHW49TZHInvj6mrV@ac-yo4iyjh-shard-00-01.ipo3ngm.mongodb.net:27017/letask?ssl=true&authSource=admin&retryWrites=true&w=majority";
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('DB Connected');

        // 1. List all sessions
        const Session = mongoose.models.Session || mongoose.model('Session', new mongoose.Schema({}, { strict: false }), 'sessions');
        const sessions = await Session.find({ mentorType: 'prementor' }).lean();
        console.log(`Found ${sessions.length} pre-mentor sessions.`);

        // 2. List all PreMentorApplications
        const PreMentorApplication = mongoose.models.PreMentorApplication || mongoose.model('PreMentorApplication', new mongoose.Schema({}, { strict: false }), 'prementorapplications');
        const apps = await PreMentorApplication.find({}).lean();
        console.log(`Found ${apps.length} pre-mentor applications.`);

        // 3. User info
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

        // Check for mismatches
        for (const session of sessions) {
            console.log(`\nSession ${session._id}:`);
            console.log(`  mentorId (in Session): ${session.mentorId}`);
            
            const app = await PreMentorApplication.findById(session.mentorId);
            if (app) {
                const user = await User.findById(app.userId);
                console.log(`  ✅ Match found in PreMentorApplication!`);
                console.log(`  Mentor Name: ${user ? user.name : 'Unknown'}`);
                console.log(`  Mentor userId: ${app.userId}`);
            } else {
                console.log(`  ❌ NO MATCH in PreMentorApplication for mentorId ${session.mentorId}`);
                // Check if it's a userId
                const user = await User.findById(session.mentorId);
                if (user) {
                    console.log(`  ⚠️ Found a match in USERS collection! (Storing userId instead of AppId)`);
                }
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
