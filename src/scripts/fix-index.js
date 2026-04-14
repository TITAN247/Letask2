const mongoose = require('mongoose');

async function fix() {
    console.log("Connecting to local MongoDB...");
    await mongoose.connect('mongodb://127.0.0.1:27017/letask');
    try {
        console.log("Dropping legacy username_1 index from users collection...");
        await mongoose.connection.collection('users').dropIndex('username_1');
        console.log("Index successfully dropped! You can now sign up users with the new schema.");
    } catch (e) {
        console.log("Index might not exist anymore or error:", e.message);
    }
    process.exit(0);
}

fix();
