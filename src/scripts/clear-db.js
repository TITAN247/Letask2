/**
 * LetAsk Database Reset Script
 * Clears ALL documents from every collection in the 'letask' database.
 * Run with: node scripts/clear-db.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'letask';

// All collections used by the LetAsk platform
const COLLECTIONS = [
  'users',
  'sessions',
  'messages',
  'mentorprofiles',
  'menteeprofiles',
  'feedbacks',
  'upgradeapplications',
];

async function clearDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await client.connect();

    const db = client.db(DB_NAME);

    console.log(`\n🗑️  Clearing database: "${DB_NAME}"\n`);
    console.log('─'.repeat(40));

    let totalDeleted = 0;

    for (const collectionName of COLLECTIONS) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();

        if (count === 0) {
          console.log(`  ⚪  ${collectionName.padEnd(25)} — already empty`);
          continue;
        }

        const result = await collection.deleteMany({});
        totalDeleted += result.deletedCount;
        console.log(`  ✅  ${collectionName.padEnd(25)} — deleted ${result.deletedCount} document(s)`);
      } catch (err) {
        console.log(`  ⚠️   ${collectionName.padEnd(25)} — skipped (not found or error)`);
      }
    }

    console.log('─'.repeat(40));
    console.log(`\n✨ Done! Total documents deleted: ${totalDeleted}`);
    console.log('📋 The database is now completely clean.\n');

  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    console.error('Make sure MongoDB is running locally on port 27017.\n');
    process.exit(1);
  } finally {
    await client.close();
  }
}

clearDatabase();
