// lib/dbConnect.ts
import mongoose from "mongoose";

let cached = (global as any).mongoose || { conn: null as mongoose.Mongoose | null, promise: null as Promise<mongoose.Mongoose> | null };

// NO top‐level env reads or throws

export async function dbConnect(): Promise<mongoose.Mongoose> {
  // 1) Read enviromnent var at call time
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  // 2) If we already connected, reuse
  if (cached.conn) {
    return cached.conn;
  }

  // 3) Otherwise, kick off a connection promise once
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
