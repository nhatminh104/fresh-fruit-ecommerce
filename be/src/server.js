import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const beDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(beDirectory, '.env') });

const { default: app } = await import('./app.js');
const { connectDatabase } = await import('./config/database.js');

const port = process.env.PORT || 5000;
try { const db = await connectDatabase(); console.log(`MongoDB connected to ${db.name}`); app.listen(port, '127.0.0.1', () => console.log(`Fresh Fruit API listening on ${port}`)); } catch (error) { console.error('Database connection failed:', error.message); process.exit(1); }
