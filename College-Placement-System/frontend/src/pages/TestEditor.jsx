import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Field, Checks, ErrorBox, Loading, useMeta, toLocalInput } from '../components.jsx';

const blankQ = () => ({ text: '', options: ['', '', '', ''], correctIndex: 0, marks: 1, topic: '' });

export default function TestEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, user } = useAuth();
  const { data: meta } = useMeta();
  const [f, setF] = useState({ title: '', description: '', instructions: '', durationMinutes: 30, startTime: '', deadline: '', negativeMarks: 0, shuffleQuestions: true, shuffleOptions: true, enforceWeekend: false, resultPolicy: 'immediate', reviewPolicy: 'after_deadline' });
  const [t, setT] = useState({ branches: [], years: [], batches: '' });
  const [students, setStudents] = useState([]), [questions, setQuestions] = useState([blankQ()]), [bankIds, setBankIds] = useState([]);
  const [bank, setBank] = useState([]), [bankQ, setBankQ] = useState(''), [stuQ, setStuQ] = useState(''), [stuRes, setStuRes] = useState([]);
  const [loading, setLoading] = useState(!!id), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const allowedBranches = isAdmin ? meta?.branches : user.coordinator?.branches;
  const allowedYears = isAdmin || !user.coordinator?.years?.length ? meta?.years : user.coordinator.years;

  useEffect(() => {
    if (!id) return;
    api.get(`/tests/${id}`).then(({ data: x }) => {
      setF({ title: x.title, description: x.description || '', instructions: x.instructions || '', durationMinutes: x.durationMinutes, startTime: toLocalInput(x.startTime), deadline: toLocalInput(x.deadline), negativeMarks: x.negativeMarks, shuffleQuestions: x.shuffleQuestions, shuffleOptions: x.shuffleOptions, enforceWeekend: x.enforceWeekend, resultPolicy: x.resultPolicy, reviewPolicy: x.reviewPolicy });
      setT({ branches: x.targets.branches, years: x.targets.years, batches: x.targets.batches.join(', ') });
      setStudents(x.targets.students.map((s) => ({ id: s, name: `student …${String(s).slice(-6)}` })));
      setQuestions(x.questions.map((q) => ({ text: q.text, topic: q.topic || '', marks: q.marks, options: q.options.map((o) => o.text), correctIndex: q.correctIndex, explanation: q.explanation })));
    }).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, [id]);

  const searchBank = async () => { try { setBank((await api.get('/questions', { params: { search: bankQ, limit: 20 } })).data.items); } catch (e) { setError(errMsg(e)); } };
  const searchStudents = async () => { try { setStuRes((await api.get('/students', { params: { search: stuQ, limit: 8 } })).data.items); } catch (e) { setError(errMsg(e)); } };
  const setQ = (i, patch) => setQuestions(questions.map((q, k) => (k === i ? { ...q, ...patch } : q)));

  const save = async (publish) => {
    setBusy(true); setError('');
    try {
      const body = {
        ...f, durationMinutes: Number(f.durationMinutes), negativeMarks: Number(f.negativeMarks),
        startTime: f.startTime && new Date(f.startTime).toISOString(), deadline: f.deadline && new Date(f.deadline).toISOString(),
        targets: { branches: t.branches, years: t.years, batches: t.batches.split(',').map((s) => s.trim()).filter(Boolean), students: students.map((s) => s.id) },
        questions: questions.filter((q) => q.text.trim()).map((q) => ({ ...q, options: q.options.filter((o) => o.trim()) })), bankQuestionIds: bankIds,
      };
      const saved = id ? (await api.put(`/tests/${id}`, body)).data : (await api.post('/tests', body)).data;
      if (publish) await api.post(`/tests/${saved._id}/publish`);
      nav('/manage/tests');
    } catch (e) { setError(errMsg(e)); window.scrollTo(0, 0); } finally { setBusy(false); }
  };
  if (loading) return <Loading />;
  return (<>
    <h1>{id ? 'Edit test' : 'Create test'}</h1><ErrorBox error={error} />
    {!isAdmin && <div className="alert warn">You can assign tests only to: {user.coordinator.branches.join(', ')}. {user.coordinator.canPublishDirectly ? '' : 'Publishing needs TPO approval.'}</div>}
    <div className="card"><h2>Details</h2>
      <Field label="Title"><input required value={f.title} onChange={set('title')} /></Field>
      <Field label="Description"><textarea rows={2} value={f.description} onChange={set('description')} /></Field>
      <Field label="Instructions shown to students"><textarea rows={2} value={f.instructions} onChange={set('instructions')} /></Field>
      <div className="form-grid">
        <Field label="Duration (minutes)"><input type="number" min="1" max="300" value={f.durationMinutes} onChange={set('durationMinutes')} /></Field>
        <Field label="Start time"><input type="datetime-local" value={f.startTime} onChange={set('startTime')} /></Field>
        <Field label="Deadline"><input type="datetime-local" value={f.deadline} onChange={set('deadline')} /></Field>
        <Field label="Negative marks per wrong answer"><input type="number" min="0" step="0.25" value={f.negativeMarks} onChange={set('negativeMarks')} /></Field>
        <Field label="Show result"><select value={f.resultPolicy} onChange={set('resultPolicy')}><option value="immediate">Immediately after submit</option><option value="after_deadline">After the deadline</option><option value="manual">When I release it</option></select></Field>
        <Field label="Answer review"><select value={f.reviewPolicy} onChange={set('reviewPolicy')}><option value="none">Never</option><option value="after_deadline">After the deadline</option><option value="immediate">Immediately after submit</option></select></Field>
      </div>
      <div className="checks"><label className="check"><input type="checkbox" checked={f.shuffleQuestions} onChange={set('shuffleQuestions')} /> Shuffle questions</label><label className="check"><input type="checkbox" checked={f.shuffleOptions} onChange={set('shuffleOptions')} /> Shuffle options</label><label className="check"><input type="checkbox" checked={f.enforceWeekend} onChange={set('enforceWeekend')} /> Weekend only (Sat/Sun, IST)</label></div>
    </div>
    <div className="card"><h2>Assign to</h2>
      <Field label="Branches"><Checks options={allowedBranches || []} value={t.branches} onChange={(v) => setT({ ...t, branches: v })} /></Field>
      <Field label="Years"><Checks options={allowedYears || []} value={t.years} onChange={(v) => setT({ ...t, years: v })} /></Field>
      <Field label="Batches" hint="Comma separated, e.g. 2026, 2027 (optional)"><input value={t.batches} onChange={(e) => setT({ ...t, batches: e.target.value })} /></Field>
      <Field label="Individual students"><div className="row"><input style={{ maxWidth: 260 }} placeholder="Search name / roll no" value={stuQ} onChange={(e) => setStuQ(e.target.value)} /><button type="button" className="btn" onClick={searchStudents}>Search</button></div></Field>
      <div className="row">{stuRes.filter((s) => !students.some((x) => x.id === s.id)).map((s) => <button type="button" key={s.id} className="btn sm" onClick={() => setStudents([...students, { id: s.id, name: s.name }])}>+ {s.name} ({s.rollNo || s.branch})</button>)}</div>
      <div className="row">{students.map((s) => <span key={s.id} className="badge">{s.name} <button type="button" aria-label={`Remove ${s.name}`} onClick={() => setStudents(students.filter((x) => x.id !== s.id))}>×</button></span>)}</div>
      {isAdmin && <small className="muted">Leave everything empty to assign the test to all students.</small>}
    </div>
    <div className="card"><h2>Questions ({questions.filter((q) => q.text.trim()).length} manual + {bankIds.length} from bank)</h2>
      {questions.map((q, i) => <div key={i} className="card">
        <div className="row between"><strong>Question {i + 1}</strong><button type="button" className="btn sm danger" onClick={() => setQuestions(questions.filter((_, k) => k !== i))}>Remove</button></div>
        <Field label="Question text"><textarea rows={2} value={q.text} onChange={(e) => setQ(i, { text: e.target.value })} /></Field>
        {q.options.map((o, k) => <div className="row" key={k}><input type="radio" name={`c${i}`} checked={q.correctIndex === k} onChange={() => setQ(i, { correctIndex: k })} aria-label={`Option ${k + 1} is correct`} /><input value={o} placeholder={`Option ${k + 1}`} onChange={(e) => setQ(i, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })} style={{ flex: 1 }} /></div>)}
        <div className="row" style={{ marginTop: '.5rem' }}><input style={{ maxWidth: 160 }} placeholder="Topic" value={q.topic} onChange={(e) => setQ(i, { topic: e.target.value })} /><input style={{ maxWidth: 100 }} type="number" min="0.25" step="0.25" title="Marks" value={q.marks} onChange={(e) => setQ(i, { marks: e.target.value })} /><small className="muted">Select the radio button of the correct option.</small></div>
      </div>)}
      <button type="button" className="btn" onClick={() => setQuestions([...questions, blankQ()])}>+ Add question</button>
      <h3>Add from question bank</h3>
      <div className="row"><input style={{ maxWidth: 260 }} placeholder="Search question text" value={bankQ} onChange={(e) => setBankQ(e.target.value)} /><button type="button" className="btn" onClick={searchBank}>Search bank</button></div>
      {bank.map((b) => <label key={b._id} className="check" style={{ margin: '.3rem 0' }}><input type="checkbox" checked={bankIds.includes(b._id)} onChange={() => setBankIds(bankIds.includes(b._id) ? bankIds.filter((x) => x !== b._id) : [...bankIds, b._id])} /> {b.text} <small className="muted">({b.topic || 'no topic'}, {b.difficulty}, {b.marks}m)</small></label>)}
    </div>
    <div className="row"><button className="btn" disabled={busy} onClick={() => save(false)}>Save draft</button><button className="btn primary" disabled={busy} onClick={() => save(true)}>{isAdmin || user.coordinator?.canPublishDirectly ? 'Save & publish' : 'Save & request approval'}</button><button className="btn" onClick={() => nav('/manage/tests')}>Cancel</button></div>
  </>);
}
