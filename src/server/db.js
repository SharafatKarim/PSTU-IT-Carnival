import mongoose from 'mongoose';

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      /* The driver's default is 30 seconds, which is far longer than any
         caller here is willing to wait: an API route behind a proxy has
         usually timed out by then, and `next build` prerenders pages that read
         the database, so an unreachable server would add half a minute per
         page. Fail fast and let the caller fall back. */
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
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

export default connectDB;
