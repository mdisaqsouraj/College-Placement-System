import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { ErrorBox } from '../components.jsx';

const clock = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); const p = (n) => String(n).padStart(2, '0'); return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`; };

export default function Exam() {
  const { testId } = useParams();
  const nav = useNavigate();
  const [phase, setPhase] = useState('intro'); // intro | running | finishing
  const [exam, setExam] = useState(null), [answers, setAnswers] = useState({}), [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0), [error, setError] = useState(''), [warn, setWarn] = useState(''), [saveState, setSaveState] = useState('saved');
  const offset = useRef(0), dirty = useRef({}), tabs = useRef(0), finished = useRef(false), ans = useRef({}), debounce = useRef(null), examRef = useRef(null);
  examRef.current = exam;

  const list = () => Object.entries(ans.current).map(([questionId, optionId]) => ({ questionId, optionId }));
  const leaveFs = () => { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); };
  const goResult = useCallback((id) => { finished.current = true; leaveFs(); nav(`/attempts/${id}/result`, { replace: true }); }, [nav]);

  // Autosave: sends only changed answers; the server merges them and rejects saves after expiry.
  const save = useCallback(async () => {
    const e = examRef.current;
    if (!e || finished.current) return;
    const changed = dirty.current; dirty.current = {};
    setSaveState('saving');
    try {
      await api.put(`/attempts/${e.attemptId}/answers`, { answers: Object.entries(changed).map(([questionId, optionId]) => ({ questionId, optionId })), tabSwitches: tabs.current });
      setSaveState('saved');
    } catch (x) {
      if (x.response?.data?.finalized) return goResult(e.attemptId);
      dirty.current = { ...changed, ...dirty.current }; setSaveState('error');
    }
  }, [goResult]);

  // Idempotent finalisation. The server decides marks; on a network failure we retry and the attempt can always be recovered.
  const finish = useCallback(async (reason) => {
    const e = examRef.current;
    if (!e || finished.current) return;
    finished.current = true; setPhase('finishing'); clearTimeout(debounce.current);
    try {
      const { data } = await api.post(`/attempts/${e.attemptId}/submit`, { reason, answers: list() });
      goResult(data.id);
    } catch (x) {
      finished.current = false;
      if (!x.response) { setError('Network problem while submitting. Retrying…'); setTimeout(() => finish(reason), 3000); }
      else { setPhase('running'); setError(errMsg(x)); }
    }
  }, [goResult]);

  const begin = async () => {
    setError('');
    try { await document.documentElement.requestFullscreen?.(); } catch { /* fullscreen is best-effort */ }
    try {
      const { data } = await api.post('/attempts/start', { testId });
      offset.current = new Date(data.serverNow).getTime() - Date.now();
      ans.current = { ...data.answers }; tabs.current = data.tabSwitches || 0;
      setExam(data); setAnswers(data.answers); setPhase('running');
    } catch (x) {
      if (x.response?.status === 409 && x.response.data.attemptId) return goResult(x.response.data.attemptId);
      setError(errMsg(x));
    }
  };

  // Server-authoritative countdown (client clock only displays; expiry is enforced by the server).
  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => {
      const rem = new Date(exam.expiresAt).getTime() - (Date.now() + offset.current);
      setLeft(rem);
      if (rem <= 0) finish('timeout');
    }, 500);
    return () => clearInterval(t);
  }, [phase, exam, finish]);

  useEffect(() => {
    if (phase !== 'running') return;
    const auto = setInterval(save, 20000);
    history.pushState({ exam: true }, '', location.href);
    const onPop = () => finish('back_navigation'); // Back button => finalise and show marks
    const onVis = () => { if (document.hidden) { tabs.current++; setWarn(`You left the exam tab. This was recorded (${tabs.current}).`); } };
    const onFs = () => { if (!document.fullscreenElement && !finished.current) { tabs.current++; setWarn('You exited fullscreen. Please return to fullscreen to continue.'); } };
    const onBefore = (e) => { e.preventDefault(); e.returnValue = ''; };
    const onHide = () => { // refresh / tab close: keep the attempt alive and push the latest answers (the student can resume until the timer ends)
      const e = examRef.current; if (!e || finished.current) return;
      fetch(`${api.defaults.baseURL}/attempts/${e.attemptId}/answers`, { method: 'PUT', keepalive: true, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ answers: list(), tabSwitches: tabs.current }) }).catch(() => {});
    };
    window.addEventListener('popstate', onPop); document.addEventListener('visibilitychange', onVis); document.addEventListener('fullscreenchange', onFs);
    window.addEventListener('beforeunload', onBefore); window.addEventListener('pagehide', onHide);
    return () => { clearInterval(auto); window.removeEventListener('popstate', onPop); document.removeEventListener('visibilitychange', onVis); document.removeEventListener('fullscreenchange', onFs); window.removeEventListener('beforeunload', onBefore); window.removeEventListener('pagehide', onHide); };
  }, [phase, save, finish]);

  const choose = (qid, oid) => {
    ans.current = { ...ans.current, [qid]: oid }; dirty.current[qid] = oid;
    setAnswers(ans.current); setSaveState('dirty');
    clearTimeout(debounce.current); debounce.current = setTimeout(save, 1200);
  };

  if (phase === 'intro') return (
    <div className="exam"><div className="card">
      <h1>Before you begin</h1><ErrorBox error={error} />
      <ul>
        <li>The timer is controlled by the server. It continues even if you refresh or lose connection.</li>
        <li>Your answers are saved automatically. If your browser closes you can resume until the time ends.</li>
        <li>Stay in fullscreen. Leaving the tab or fullscreen is recorded and visible to the TPO.</li>
        <li><strong>Pressing the browser Back button will submit your test and show your final result.</strong></li>
        <li>Questions and options are shuffled. Marks are calculated only by the server.</li>
      </ul>
      <div className="row"><button className="btn primary" onClick={begin}>Begin test (enter fullscreen)</button><button className="btn" onClick={() => nav('/tests')}>Cancel</button></div>
    </div></div>
  );
  if (phase === 'finishing' || !exam) return <div className="exam"><div className="card center">Submitting your answers…<ErrorBox error={error} /></div></div>;

  const q = exam.questions[idx];
  const answered = Object.values(answers).filter(Boolean).length;
  return (
    <div className="exam" onContextMenu={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()}>
      <div className="exam-top">
        <div><strong>{exam.title}</strong><br /><small className="muted">{answered}/{exam.questions.length} answered · {saveState === 'saved' ? '✓ saved' : saveState === 'saving' ? 'saving…' : saveState === 'error' ? '⚠ not saved, retrying' : 'unsaved changes'}</small></div>
        <div className={`timer ${left < 300000 ? 'low' : ''}`} role="timer" aria-live="off">{clock(left)}</div>
        <button className="btn primary" onClick={() => { if (confirm(`Submit now? ${exam.questions.length - answered} question(s) unanswered.`)) finish('manual'); }}>Submit</button>
      </div>
      {warn && <div className="alert warn" role="alert"><span>{warn}</span><span>{!document.fullscreenElement && <button className="btn sm" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}>Return to fullscreen</button>} <button className="btn sm" onClick={() => setWarn('')}>Dismiss</button></span></div>}
      <ErrorBox error={error} />
      <div className="grid wide" style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(220px,1fr)' }}>
        <div className="card">
          <small className="muted">Question {idx + 1} of {exam.questions.length} · {q.marks} mark{q.marks > 1 ? 's' : ''}{exam.negativeMarks ? ` · −${exam.negativeMarks} if wrong` : ''}</small>
          <h2 style={{ whiteSpace: 'pre-wrap' }}>{q.text}</h2>
          <div role="radiogroup" aria-label="Options">
            {q.options.map((o) => <label key={o.id} className={`opt ${answers[q.id] === o.id ? 'sel' : ''}`}><input type="radio" name={q.id} checked={answers[q.id] === o.id} onChange={() => choose(q.id, o.id)} /> <span>{o.text}</span></label>)}
          </div>
          <div className="row between">
            <span className="row"><button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>‹ Previous</button><button className="btn" disabled={idx === exam.questions.length - 1} onClick={() => setIdx(idx + 1)}>Next ›</button></span>
            <button className="btn sm" disabled={!answers[q.id]} onClick={() => choose(q.id, null)}>Clear answer</button>
          </div>
        </div>
        <div className="card"><h3>Question palette</h3>
          <div className="palette">{exam.questions.map((x, i) => <button key={x.id} className={`${answers[x.id] ? 'done' : ''} ${i === idx ? 'cur' : ''}`} onClick={() => setIdx(i)} aria-label={`Question ${i + 1}${answers[x.id] ? ' answered' : ''}`}>{i + 1}</button>)}</div>
          <p className="muted"><small>Green = answered. Tab/fullscreen exits so far: {tabs.current}</small></p>
        </div>
      </div>
    </div>
  );
}
