import { useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useFetch, useMeta, Field, Loading, ErrorBox, Empty, Badge, Pager } from '../components.jsx';

const blank = { text: '', topic: '', difficulty: 'medium', marks: 1, options: ['', '', '', ''], correctIndex: 0, explanation: '' };

export default function QuestionBank() {
  const { isAdmin, user } = useAuth();
  const { data: meta } = useMeta();
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [q, setQ] = useState(search);
  const [form, setForm] = useState(null), [error, setError] = useState('');
  const { data, loading, error: err, reload } = useFetch(() => api.get('/questions', { params: { page, limit: 15, search } }).then((r) => r.data), [page, search]);
  const save = async (e) => {
    e.preventDefault(); setError('');
    try { const body = { ...form, marks: Number(form.marks), options: form.options.filter((o) => o.trim()) }; if (form._id) await api.put(`/questions/${form._id}`, body); else await api.post('/questions', body); setForm(null); reload(); } catch (x) { setError(errMsg(x)); }
  };
  const del = async (id) => { if (!confirm('Delete this question?')) return; try { await api.delete(`/questions/${id}`); reload(); } catch (x) { setError(errMsg(x)); } };
  const mine = (x) => isAdmin || x.createdBy === user._id;
  return (<>
    <div className="row between"><h1>Question bank</h1><button className="btn primary" onClick={() => setForm({ ...blank })}>+ New question</button></div>
    <ErrorBox error={err || error} />
    {form && <form className="card" onSubmit={save}><h2>{form._id ? 'Edit' : 'New'} question</h2>
      <Field label="Question"><textarea required rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field>
      {form.options.map((o, k) => <div className="row" key={k}><input type="radio" name="correct" checked={form.correctIndex === k} onChange={() => setForm({ ...form, correctIndex: k })} aria-label={`Option ${k + 1} correct`} /><input style={{ flex: 1 }} placeholder={`Option ${k + 1}`} value={o} onChange={(e) => setForm({ ...form, options: form.options.map((x, j) => (j === k ? e.target.value : x)) })} /></div>)}
      <div className="form-grid" style={{ marginTop: '.6rem' }}>
        <Field label="Topic"><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></Field>
        <Field label="Difficulty"><select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>{meta?.difficulties.map((d) => <option key={d}>{d}</option>)}</select></Field>
        <Field label="Marks"><input type="number" min="0.25" step="0.25" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} /></Field>
      </div>
      <Field label="Explanation (shown in review)"><input value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} /></Field>
      <div className="row"><button className="btn primary">Save</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div></form>}
    <form className="row" style={{ marginBottom: '1rem' }} onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(q); }}><input style={{ maxWidth: 280 }} placeholder="Search questions" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn">Search</button></form>
    {loading ? <Loading /> : !data.items.length ? <Empty>No questions yet.</Empty> : data.items.map((x) => <div className="card" key={x._id}>
      <div className="row between"><strong>{x.text}</strong><span className="row"><Badge>{x.difficulty}</Badge><small className="muted">{x.topic} · {x.marks}m</small></span></div>
      <ol type="A">{x.options.map((o, i) => <li key={i} style={i === x.correctIndex ? { color: 'var(--ok)', fontWeight: 600 } : null}>{o}</li>)}</ol>
      {mine(x) && <div className="row"><button className="btn sm" onClick={() => setForm({ ...x, options: [...x.options, '', '', '', ''].slice(0, Math.max(4, x.options.length)) })}>Edit</button><button className="btn sm danger" onClick={() => del(x._id)}>Delete</button></div>}</div>)}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}
