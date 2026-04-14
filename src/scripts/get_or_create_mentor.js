require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const users = db.collection('users');
    let mentor = await users.findOne({ role: { $in: ['mentor', 'promentor']} });
    
    if (mentor) {
        const hash = await bcrypt.hash('password123', 10);
        await users.updateOne({ _id: mentor._id }, { $set: { password: hash } });
        console.log(`FOUND_MENTOR: Email=${mentor.email} Password=password123`);
    } else {
        const hash = await bcrypt.hash('password123', 10);
        await users.insertOne({ email: "promentor@example.com", password: hash, role: "promentor", name: "ProMentor" });
        console.log(`CREATED_MENTOR: Email=promentor@example.com Password=password123`);
    }
    process.exit(0);
}
run();
