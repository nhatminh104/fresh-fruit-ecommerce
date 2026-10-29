import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';
const port = process.env.PORT || 5000;
try { const db = await connectDatabase(); console.log(`MongoDB connected to ${db.name}`); app.listen(port, '127.0.0.1', () => console.log(`Fresh Fruit API listening on ${port}`)); } catch (error) { console.error('Database connection failed:', error.message); process.exit(1); }
