const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI.replace(/:([^:@]{3})[^:@]*@/, ':$1***@'));
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully to MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("Connection Failed:", err.message);
    process.exit(1);
  }
}
check();
