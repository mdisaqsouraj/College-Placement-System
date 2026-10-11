// Rejects Mongo operator injection ({"$gt": ""}, "a.b" keys) in body and query.
const bad = (o, depth = 0) => {
  if (depth > 8 || o == null || typeof o !== 'object') return false;
  return Object.keys(o).some((k) => k.startsWith('$') || k.includes('.') || bad(o[k], depth + 1));
};
export default function sanitize(req, res, next) {
  if (bad(req.body) || bad(req.query)) return res.status(400).json({ message: 'Invalid characters in request keys' });
  next();
}
