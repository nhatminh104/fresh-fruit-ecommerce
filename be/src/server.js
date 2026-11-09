import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const beDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Ưu tiên .env ở root theo tài liệu project, đồng thời hỗ trợ .env trong be.
dotenv.config({ path: path.resolve(beDirectory, '..', '.env') });
dotenv.config({ path: path.join(beDirectory, '.env') });

const { default: app } = await import('./app.js');
const { connectDatabase } = await import('./config/database.js');

const port = process.env.PORT || 5000;
try {
  const db = await connectDatabase();
  console.log(`MongoDB connected to ${db.name}`);
  const server = app.listen(port, '127.0.0.1', () => console.log(`Fresh Fruit API listening on ${port}`));
  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down Fresh Fruit API`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  console.error('Database connection failed:', error.message);
  process.exit(1);
}
