import { validateEnv, env } from './config/env.js';
validateEnv(); // load .env and fail fast before importing anything that needs it
const { connectDB } = await import('./config/db.js');
const { default: app } = await import('./app.js');
const { Attempt } = await import('./models/Exam.js');
const { finalizeAttempt } = await import('./services/attempts.js');

await connectDB();
app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));

// Safety net: finalise attempts whose server-side deadline passed even if the student's browser disappeared.
const sweep = async () => {
  try {
    const stale = await Attempt.find({ status: 'in_progress', expiresAt: { $lte: new Date() } }).select('_id').limit(200);
    for (const a of stale) await finalizeAttempt(a._id, 'timeout');
    if (stale.length) console.log(`Auto-finalised ${stale.length} expired attempt(s)`);
  } catch (e) { console.error('sweep failed:', e.message); }
};
setInterval(sweep, 30000).unref();
sweep();
process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
