import mongoose from 'mongoose';
import { CATEGORIES, DIFFICULTIES } from '../constants.js';
const { Schema } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });

export const PracticeQuestion = mongoose.model('PracticeQuestion', new Schema({
  category: { type: String, enum: CATEGORIES, required: true, index: true },
  topic: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: DIFFICULTIES, required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  options: { type: [String], validate: (a) => a.length >= 2 && a.length <= 6 },
  correctIndex: { type: Number, required: true, min: 0 },
  explanation: String,
  hash: { type: String, index: true },
  source: { type: String, default: 'seed' },
}));

const sessionSchema = new Schema({
  user: { ...ref('User'), required: true, index: true },
  kind: { type: String, enum: ['practice', 'daily'], default: 'practice' },
  dayKey: String,
  category: String,
  difficulty: String,
  items: [{ question: ref('PracticeQuestion'), order: [Number], _id: false }],
  timeLimitSec: Number,
  startedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
  submittedAt: Date,
  result: { correct: Number, total: Number, xpEarned: Number, timeTakenSec: Number, overtime: Boolean },
}, { timestamps: true });
sessionSchema.index({ user: 1, kind: 1, dayKey: 1 });
export const PracticeSession = mongoose.model('PracticeSession', sessionSchema);

// Gamification state lives here, completely separate from official exam Attempts.
export const PracticeProfile = mongoose.model('PracticeProfile', new Schema({
  user: { ...ref('User'), required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  lastPracticeDay: String,
  sessions: { type: Number, default: 0 },
  totalAttempted: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  badges: [{ key: String, earnedAt: Date, _id: false }],
  topicStats: [{ category: String, topic: String, attempted: Number, correct: Number, _id: false }],
}, { timestamps: true }));
