// Pre-fill the practice bank with AI questions. Usage:
//   npm run generate -- "Quantitative Aptitude" easy 10
//   npm run generate -- all all 5        (5 per category/difficulty combination)
import { validateEnv } from '../src/config/env.js';
validateEnv();
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { generateQuestions } from '../src/services/aiQuestions.js';
import { aiEnabled } from '../src/services/llm.js';
import { CATEGORIES, DIFFICULTIES } from '../src/constants.js';

if (!aiEnabled()) { console.error(`Set GROQ_API_KEY or GEMINI_API_KEY in backend/.env first.`); process.exit(1); }
const [cat = 'all', diff = 'all', n = '10'] = process.argv.slice(2);
const cats = cat === 'all' ? CATEGORIES : [cat], diffs = diff === 'all' ? DIFFICULTIES : [diff];
await connectDB();
for (const category of cats) for (const difficulty of diffs) {
  try { console.log(category, difficulty, await generateQuestions({ category, difficulty, count: Number(n) })); }
  catch (e) { console.error(category, difficulty, 'FAILED:', e.message); }
}
await mongoose.disconnect();