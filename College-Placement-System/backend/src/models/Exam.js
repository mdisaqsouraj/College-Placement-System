import mongoose from 'mongoose';
import { BRANCHES, DIFFICULTIES } from '../constants.js';
const { Schema } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });
const optionsValidator = { validator: (a) => a.length >= 2 && a.length <= 6, message: 'A question needs 2 to 6 options' };

export const Question = mongoose.model('Question', new Schema({
  topic: { type: String, trim: true, maxlength: 80 },
  difficulty: { type: String, enum: DIFFICULTIES, default: 'medium' },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  options: { type: [{ type: String, trim: true, maxlength: 500 }], validate: optionsValidator },
  correctIndex: { type: Number, required: true, min: 0 },
  marks: { type: Number, default: 1, min: 0.25, max: 20 },
  explanation: { type: String, trim: true, maxlength: 2000 },
  createdBy: ref('User'),
}, { timestamps: true }));

const testQuestionSchema = new Schema({
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  topic: { type: String, trim: true, maxlength: 80 },
  options: { type: [new Schema({ text: { type: String, required: true, trim: true, maxlength: 500 } })], validate: optionsValidator },
  correctIndex: { type: Number, required: true, min: 0 },
  marks: { type: Number, default: 1, min: 0.25, max: 20 },
  explanation: { type: String, trim: true, maxlength: 2000 },
});

const testSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, trim: true, maxlength: 2000 },
  instructions: { type: String, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['draft', 'pending_approval', 'published', 'closed'], default: 'draft', index: true },
  durationMinutes: { type: Number, required: true, min: 1, max: 300 },
  startTime: { type: Date, required: true },
  deadline: { type: Date, required: true },
  negativeMarks: { type: Number, default: 0, min: 0, max: 20 }, // deducted per wrong answer
  shuffleQuestions: { type: Boolean, default: true },
  shuffleOptions: { type: Boolean, default: true },
  enforceWeekend: { type: Boolean, default: false },
  resultPolicy: { type: String, enum: ['immediate', 'after_deadline', 'manual'], default: 'immediate' },
  reviewPolicy: { type: String, enum: ['none', 'after_deadline', 'immediate'], default: 'after_deadline' },
  resultsReleased: { type: Boolean, default: false },
  targets: {
    branches: [{ type: String, enum: BRANCHES }],
    years: [{ type: Number, min: 1, max: 4 }],
    batches: [{ type: String, trim: true }],
    students: [ref('User')],
  },
  questions: [testQuestionSchema],
  questionCount: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  createdBy: { ...ref('User'), required: true, index: true },
  approval: { requestedAt: Date, decidedBy: ref('User'), decidedAt: Date, note: String },
}, { timestamps: true });

testSchema.pre('validate', function (next) {
  this.questionCount = this.questions.length;
  this.totalMarks = this.questions.reduce((s, q) => s + q.marks, 0);
  for (const q of this.questions) if (q.correctIndex >= q.options.length) return next(new Error('correctIndex out of range'));
  next();
});
export const Test = mongoose.model('Test', testSchema);

const attemptSchema = new Schema({
  test: { ...ref('Test'), required: true },
  student: { ...ref('User'), required: true },
  status: { type: String, enum: ['in_progress', 'submitted', 'auto_submitted'], default: 'in_progress' },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  submittedAt: Date,
  finalizeReason: String,
  order: [{ questionId: Schema.Types.ObjectId, optionOrder: [Schema.Types.ObjectId], _id: false }],
  answers: [{ questionId: Schema.Types.ObjectId, optionId: Schema.Types.ObjectId, _id: false }],
  lastSavedAt: Date,
  tabSwitches: { type: Number, default: 0 },
  score: Number, totalMarks: Number, correct: Number, wrong: Number, unanswered: Number,
}, { timestamps: true });
attemptSchema.index({ test: 1, student: 1 }, { unique: true }); // one attempt per student per test
attemptSchema.index({ status: 1, expiresAt: 1 });
export const Attempt = mongoose.model('Attempt', attemptSchema);
