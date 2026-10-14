import { useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../api.js';
import { useFetch, useMeta, Loading, ErrorBox, Empty, Badge, Field, fmt } from '../components.jsx';

const BADGE_NAMES = { first_quiz: '🎯 First Quiz', perfect_score: '💯 Perfect Score', streak_3: '🔥 3-Day Streak', streak_7: '🔥 7-Day Streak', xp_500: '⭐ 500 XP', xp_2000: '🌟 2000 XP', century: '🏅 100 Correct', daily_hero: '📅 Daily Hero' };
const clock = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

function Quiz({ session, onDone, onError }) {
  const [idx, setIdx] = useState(0), [answers, setAnswers] = useState({}), [left, setLeft] = useState(0), [busy, setBusy] = useState(false);
  const offset = useRef(new Date(session.serverNow).getTime() - Date.now()), sent = useRef(false), ansRef = useRef({});
  ansRef.current = answers;
  const submit = async () => {
    if (sent.current) return; sent.current = true; setBusy(true);
    try { onDone((await api.post(`/practice/sessions/${session.sessionId}/submit`, { answers: Object.entries(ansRef.current).map(([questionId, optionIndex]) => ({ questionId, optionIndex })) })).data); }
    catch (x) { sent.current = false; setBusy(false); onError(errMsg(x)); }
  };
  useEffect(() => {
    const end = new Date(session.startedAt).getTime() + session.timeLimitSec * 1000;
    const t = setInterval(() => { const r = Math.ceil((end - (Date.now() + offset.current)) / 1000); setLeft(r); if (r <= 0) submit(); }, 500);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, []);
  const q = session.questions[idx];
  return (
    <div className="card">
      <div className="row between"><strong>{session.category} · {session.difficulty}</strong><span className={`timer ${left < 30 ? 'low' : ''}`}>{clock(left)}</span></div>
      <small className="muted">Question {idx + 1} of {session.questions.length} · {q.topic} · <Badge>{q.difficulty}</Badge></small>
      <h2>{q.text}</h2>
      {q.options.map((o, i) => <label key={i} className={`opt ${answers[q.id] === i ? 'sel' : ''}`}><input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} /> {o}</label>)}
      <div className="row between">
        <span className="row"><button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>‹ Prev</button><button className="btn" disabled={idx === session.questions.length - 1} onClick={() => setIdx(idx + 1)}>Next ›</button></span>
        <button className="btn primary" disabled={busy} onClick={submit}>{busy ? 'Scoring…' : 'Finish quiz'}</button>
      </div>
    </div>
  );
}

export default function Practice() {
  const { data: meta } = useMeta();
  const prof = useFetch(() => api.get('/practice/profile').then((r) => r.data), []);
  const lb = useFetch(() => api.get('/practice/leaderboard').then((r) => r.data), []);
  const [f, setF] = useState({ category: 'any', difficulty: 'mixed', count: 5 });
  const [session, setSession] = useState(null), [result, setResult] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const start = async (daily) => {
    setError(''); setBusy(true); setResult(null);
    try { const d = (await (daily ? api.post('/practice/daily') : api.post('/practice/sessions', { ...f, count: Number(f.count) }))).data; setSession(d); if (d.notice) setError(d.notice); } catch (x) { setError(errMsg(x)); } finally { setBusy(false); }
  };
  const done = (r) => { setSession(null); setResult(r); prof.reload(); lb.reload(); };

  if (session) return <><h1>Practice quiz</h1><ErrorBox error={error} /><Quiz session={session} onDone={done} onError={setError} /></>;
  const p = prof.data;
  const lo = p ? 50 * (p.level - 1) ** 2 : 0, hi = p ? 50 * p.level ** 2 : 1;
  return (<>
    <h1>Aptitude practice</h1>
    <p className="muted">Practice XP and scores are separate from official examination results.</p>
    <ErrorBox error={error || prof.error} />
    {result && <div className="card">
      <h2>Quiz complete: {result.result.correct}/{result.result.total} correct · +{result.result.xpEarned} XP</h2>
      {result.result.overtime && <div className="alert warn">You went over the time limit, so XP was halved.</div>}
      {result.newBadges?.length > 0 && <div className="alert ok">New badges: {result.newBadges.map((b) => BADGE_NAMES[b] || b).join(', ')}</div>}
      {result.review.map((q, i) => <div key={q.id} style={{ marginBottom: '1rem' }}><strong>{i + 1}. {q.text}</strong>
        {q.options.map((o, k) => <div key={k} className={`opt ${k === q.correctIndex ? 'right' : k === q.selectedIndex ? 'wrong' : ''}`}>{o}{k === q.selectedIndex && ' (your answer)'}{k === q.correctIndex && ' ✓'}</div>)}
        {q.explanation && <small className="muted">{q.explanation}</small>}</div>)}
      <button className="btn" onClick={() => setResult(null)}>Close review</button>
    </div>}
    {prof.loading ? <Loading /> : p && <>
      <div className="grid">
        <div className="card"><div className="stat">Lv {p.level}</div><div className="bar"><i style={{ width: `${Math.min(100, ((p.xp - lo) / (hi - lo)) * 100)}%` }} /></div><div className="stat-l">{p.xp} / {hi} XP</div></div>
        <div className="card"><div className="stat">🔥 {p.streak}</div><div className="stat-l">Current streak (best {p.bestStreak})</div></div>
        <div className="card"><div className="stat">{p.accuracy ?? '—'}{p.accuracy != null && '%'}</div><div className="stat-l">Accuracy · {p.sessions} quizzes</div></div>
      </div>
      <div className="grid wide">
        <div className="card"><h2>Start a quiz</h2>
          <div className="form-grid">
            <Field label="Category"><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="any">All categories</option>{meta?.categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Difficulty"><select value={f.difficulty} onChange={(e) => setF({ ...f, difficulty: e.target.value })}><option value="mixed">Mixed</option>{meta?.difficulties.map((d) => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Questions"><select value={f.count} onChange={(e) => setF({ ...f, count: e.target.value })}>{[5, 10, 15].map((n) => <option key={n}>{n}</option>)}</select></Field>
          </div>
          <div className="row"><button className="btn primary" disabled={busy} onClick={() => start(false)}>{busy ? 'Preparing fresh questions…' : 'Start timed quiz'}</button><button className="btn" disabled={busy || p.dailyDone} onClick={() => start(true)}>{p.dailyDone ? '✓ Daily challenge done' : '📅 Daily challenge (2× XP)'}</button></div>
        </div>
        <div className="card"><h2>Badges</h2>{p.badges.length ? <div className="row">{p.badges.map((b) => <span key={b.key} className="badge">{BADGE_NAMES[b.key] || b.key}</span>)}</div> : <Empty>Complete a quiz to earn badges</Empty>}</div>
      </div>
      <div className="grid wide">
        <div className="card"><h2>Weak topics</h2>{p.weakTopics.length ? p.weakTopics.map((t) => <div key={t.category + t.topic} className="row between"><span>{t.topic} <small className="muted">({t.category})</small></span><strong>{t.accuracy}%</strong></div>) : <Empty>Answer a few more questions to see weak topics</Empty>}
          {p.topics.length > 0 && <><h3>All topics</h3>{p.topics.map((t) => <div key={t.category + t.topic}><div className="row between"><small>{t.topic}</small><small>{t.accuracy}% ({t.attempted})</small></div><div className="bar"><i style={{ width: `${t.accuracy}%` }} /></div></div>)}</>}</div>
        <div className="card"><h2>Leaderboard</h2>{lb.data?.items.length ? <table><tbody>{lb.data.items.map((r) => <tr key={r.rank} style={r.me ? { fontWeight: 700 } : null}><td>#{r.rank}</td><td>{r.name}</td><td>Lv {r.level}</td><td>{r.xp} XP</td></tr>)}</tbody></table> : <Empty>No scores yet. Be the first!</Empty>}{lb.data?.myRank && <small className="muted">Your rank: #{lb.data.myRank}</small>}</div>
      </div>
      <div className="card"><h2>Practice history</h2>{p.history.length ? <div className="table-wrap"><table><thead><tr><th>When</th><th>Type</th><th>Category</th><th>Score</th><th>XP</th></tr></thead><tbody>{p.history.map((h) => <tr key={h._id}><td>{fmt(h.submittedAt)}</td><td>{h.kind}</td><td>{h.category} · {h.difficulty}</td><td>{h.result.correct}/{h.result.total}</td><td>+{h.result.xpEarned}</td></tr>)}</tbody></table></div> : <Empty>No quizzes yet</Empty>}</div>
    </>}
  </>);
}
