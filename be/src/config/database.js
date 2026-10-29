import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and set MongoDB connection details.');
  mongoose.connection.on('error', (error) => console.error('MongoDB error:', error.message));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return { connected: mongoose.connection.readyState === 1, name: mongoose.connection.name };
}

export function databaseHealth() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return { status: states[mongoose.connection.readyState] || 'unknown', name: mongoose.connection.name || null };
}

export async function closeDatabase() { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); }
