export const notFound = (_req, res) => res.status(404).json({ message: 'Route not found' });

export function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id or value' });
  if (err.code === 11000) return res.status(409).json({ message: `Duplicate value for: ${Object.keys(err.keyValue || {}).join(', ') || 'unique field'}` });
  if (err.name === 'MulterError') return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 2 MB)' : err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Malformed JSON body' });
  if (err.status) return res.status(err.status).json({ message: err.message, ...(err.extra || {}) });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
