import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore
let cached = global.mongoose;

if (!cached) {
    // @ts-ignore
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            dbName: 'letask',
            // Atlas optimized timeouts
            serverSelectionTimeoutMS: 30000, // 30 seconds for Atlas
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 30000, // 30 seconds
            maxPoolSize: 10,
            minPoolSize: 5, // Keep minimum connections for faster responses
            retryWrites: true,
            retryReads: true,
            // Atlas specific settings for reliability
            maxIdleTimeMS: 30000,
            heartbeatFrequencyMS: 10000,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('✅ MongoDB Atlas connected successfully');
            console.log('📊 Database: letask');
            return mongoose;
        }).catch((error) => {
            console.error('❌ MongoDB Atlas connection error:', error);
            console.error('🔧 Troubleshooting:');
            console.error('   1. Check MONGODB_URI in .env.local');
            console.error('   2. Whitelist your IP in Atlas Network Access');
            console.error('   3. Ensure cluster is running (not paused)');
            console.error('   4. Verify database user credentials');
            cached.promise = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Export connection health check
export async function checkDbHealth() {
    try {
        const conn = await dbConnect();
        const state = mongoose.connection.readyState;
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        return {
            healthy: state === 1,
            state: state === 0 ? 'disconnected' : state === 1 ? 'connected' : state === 2 ? 'connecting' : 'disconnecting'
        };
    } catch (error) {
        return { healthy: false, state: 'error', error: (error as Error).message };
    }
}

export default dbConnect;
