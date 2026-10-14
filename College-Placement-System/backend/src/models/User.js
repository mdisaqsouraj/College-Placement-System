import mongoose from 'mongoose';
import { ROLES, BRANCHES } from '../constants.js';
const { Schema } = mongoose;

const coordinatorSchema = new Schema({
  active: { type: Boolean, default: false },
  memberYear: Number,
  branches: [{ type: String, enum: BRANCHES }],
  years: [{ type: Number, min: 1, max: 4 }],
  canCreateTests: { type: Boolean, default: true },
  canPublishDirectly: { type: Boolean, default: false },
  canViewResults: { type: Boolean, default: true },
  grantedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  grantedAt: Date,
  revokedAt: Date,
}, { _id: false });

const studentSchema = new Schema({
  rollNo: { type: String, trim: true, maxlength: 30 },
  branch: { type: String, enum: BRANCHES },
  year: { type: Number, min: 1, max: 4 },
  batch: { type: String, trim: true, maxlength: 20 },
  cgpa: { type: Number, min: 0, max: 10 },
  backlogs: { type: Number, min: 0, max: 50, default: 0 },
  skills: [{ type: String, trim: true, maxlength: 40 }],
  phone: { type: String, trim: true, match: /^[0-9+\-\s]{7,15}$/ },
  resume: { file: String, originalName: String, size: Number, uploadedAt: Date },
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT, index: true },
  active: { type: Boolean, default: true },
  avatar: { type: String, maxlength: 200000 },
  student: studentSchema,
  coordinator: coordinatorSchema,
}, { timestamps: true });

userSchema.index({ 'student.rollNo': 1 }, { unique: true, partialFilterExpression: { 'student.rollNo': { $type: 'string' } } });
userSchema.index({ 'student.branch': 1, 'student.year': 1 });
userSchema.set('toJSON', { transform: (_d, r) => { delete r.passwordHash; delete r.__v; return r; } });

export default mongoose.model('User', userSchema);
