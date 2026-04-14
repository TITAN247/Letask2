const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://shivansh0962_db_user:NiDgiPFtg3HuJLAQ@letask1.ipo3ngm.mongodb.net/?appName=LETASK1';

async function testConnection() {
  console.log('--- Database Diagnostic ---');
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✓ Successfully connected to MongoDB Atlas!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('ℹ The database is currently EMPTY (no collections found).');
    } else {
      console.log('Found collections:');
      for (let coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(` - ${coll.name}: ${count} documents`);
      }
    }
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    if (error.message.includes('IP not whitelisted')) {
      console.log('TIP: Make sure you have whitelisted "0.0.0.0/0" in your MongoDB Atlas Network Access settings.');
    }
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testConnection();
