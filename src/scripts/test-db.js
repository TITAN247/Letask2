const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://teamletask_db_user:0KIiAfONfbm82pyw@letask.lsirwi3.mongodb.net/?appName=Letask';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // timeout after 5s instead of 30s
        });
        console.log('SUCCESS: Connected to MongoDB successfully!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR: Could not connect to MongoDB.');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.name === 'MongooseServerSelectionError') {
            console.error('\nPOSSIBLE CAUSES:');
            console.error('1. Your IP address is not whitelisted in MongoDB Atlas.');
            console.error('2. Firewall or network restrictions block port 27017.');
            console.error('3. The database cluster is down or unreachable.');
        }
    }
}

testConnection();
