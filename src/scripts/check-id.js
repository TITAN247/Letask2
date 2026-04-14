const mongoose = require('mongoose');

async function checkId() {
    const MONGODB_URI = "mongodb://shivansh0962_db_user:kHW49TZHInvj6mrV@ac-yo4iyjh-shard-00-01.ipo3ngm.mongodb.net:27017/letask?ssl=true&authSource=admin&retryWrites=true&w=majority";
    await mongoose.connect(MONGODB_URI);
    
    const id = "69d3ddda6a4e8b57246a28d0";

    const collections = [
        'users',
        'prementorapplications',
        'mentorprofiles',
        'sessions'
    ];

    console.log(`Searching for ID: ${id}`);

    for (const col of collections) {
        const Model = mongoose.models[col] || mongoose.model(col, new mongoose.Schema({}, { strict: false }), col);
        const doc = await Model.findById(id).lean();
        if (doc) {
            console.log(`\n✅ Found in collection: ${col}`);
            console.log(JSON.stringify(doc, null, 2));
        }
    }
    
    await mongoose.disconnect();
}

checkId();
