import { Notification, AuditLog } from '../models/Misc.js';

export async function notifyUsers(userIds, { title, message, type = 'info', link }) {
  const ids = [...new Set(userIds.map(String))];
  if (!ids.length) return;
  await Notification.insertMany(ids.map((user) => ({ user, title, message, type, link })), { ordered: false });
}

export async function audit(req, action, { targetType, targetId, details } = {}) {
  try {
    await AuditLog.create({ actor: req.user?._id, actorRole: req.user?.role, action, targetType, targetId: targetId && String(targetId), details, ip: req.ip });
  } catch (e) { console.error('audit log failed', e.message); }
}
