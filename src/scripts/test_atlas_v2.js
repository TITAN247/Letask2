const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://shivansh0962_db_user:NiDgiPFtg3HuJLAQ@letask1.ipo3ngm.mongodb.net/?appName=LETASK1';

async function testConnection() {
  console.log('START_DIAGNOSTIC');
  try {
    console.log('CONNECTING...');
    await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('CONNECTED');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`COLL_COUNT: ${collections.length}`);
    
    for (let coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`COLL: ${coll.name} | COUNT: ${count}`);
    }
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
  } finally {
    process.exit(0);
  }
}

testConnection();
