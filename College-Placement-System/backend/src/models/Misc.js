import mongoose from 'mongoose';
const { Schema } = mongoose;

export const Notification = mongoose.model('Notification', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, default: 'info' },
  title: { type: String, required: true },
  message: String,
  link: String,
  read: { type: Boolean, default: false },
}, { timestamps: true }));

export const AuditLog = mongoose.model('AuditLog', new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  actorRole: String,
  action: { type: String, required: true, index: true },
  targetType: String,
  targetId: String,
  details: Schema.Types.Mixed,
  ip: String,
}, { timestamps: true }));
