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
            // Increased timeouts for slow networks
            serverSelectionTimeoutMS: 60000, // 60 seconds - doubled for reliability
            socketTimeoutMS: 90000, // 90 seconds
            connectTimeoutMS: 60000, // 60 seconds - doubled
            maxPoolSize: 5, // Reduced to prevent connection exhaustion
            minPoolSize: 1, // Reduced minimum
            retryWrites: true,
            retryReads: true,
            // Connection reliability settings
            maxIdleTimeMS: 60000,
            heartbeatFrequencyMS: 30000, // Increased heartbeat interval
            family: 4, // Use IPv4 (sometimes IPv6 causes issues)
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('✅ MongoDB Atlas connected successfully');
            console.log('📊 Database: letask');
            return mongoose;
        }).catch((error) => {
            console.error('❌ MongoDB Atlas connection error:', error.message);
            console.error('🔧 Troubleshooting:');
            console.error('   1. Check MONGODB_URI in .env.local');
            console.error('   2. Whitelist your IP in Atlas Network Access (0.0.0.0/0 for all IPs)');
            console.error('   3. Ensure cluster is running (not paused)');
            console.error('   4. Verify database user credentials');
            console.error('   5. Check your internet connection');
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

// Export a more resilient connection function with retry
export async function dbConnectWithRetry(maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const conn = await dbConnect();
            if (attempt > 1) {
                console.log(`✅ MongoDB connected on attempt ${attempt}`);
            }
            return conn;
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ MongoDB connection attempt ${attempt} failed:`, (error as Error).message);
            
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * attempt, 5000); // Exponential backoff: 1s, 2s, 3s...
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`❌ Failed to connect to MongoDB after ${maxRetries} attempts`);
    throw lastError;
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
