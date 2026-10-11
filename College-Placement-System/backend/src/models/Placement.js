import mongoose from 'mongoose';
import { BRANCHES, APPLICATION_STATUSES } from '../constants.js';
const { Schema } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });

export const Company = mongoose.model('Company', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120, unique: true },
  industry: { type: String, trim: true, maxlength: 80 },
  website: { type: String, trim: true, maxlength: 200 },
  location: { type: String, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 2000 },
  createdBy: ref('User'),
}, { timestamps: true }));

export const Drive = mongoose.model('Drive', new Schema({
  company: { ...ref('Company'), required: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  role: { type: String, trim: true, maxlength: 100 },
  ctcLpa: { type: Number, min: 0 },
  location: { type: String, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 4000 },
  deadline: { type: Date, required: true },
  driveDate: Date,
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  eligibility: {
    minCgpa: { type: Number, min: 0, max: 10, default: 0 },
    maxBacklogs: { type: Number, min: 0, default: 0 },
    branches: [{ type: String, enum: BRANCHES }],
    years: [{ type: Number, min: 1, max: 4 }],
    requiredSkills: [{ type: String, trim: true }],
  },
  rounds: [{ type: String, trim: true }],
  createdBy: ref('User'),
}, { timestamps: true }));

const applicationSchema = new Schema({
  drive: { ...ref('Drive'), required: true },
  student: { ...ref('User'), required: true, index: true },
  status: { type: String, enum: APPLICATION_STATUSES, default: 'applied' },
  history: [{ status: String, note: String, by: ref('User'), at: { type: Date, default: Date.now }, _id: false }],
}, { timestamps: true });
applicationSchema.index({ drive: 1, student: 1 }, { unique: true });
export const Application = mongoose.model('Application', applicationSchema);
