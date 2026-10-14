import { useState } from 'react';
import api, { errMsg, download } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Field, ErrorBox, useMeta, fmt } from '../components.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { data: meta } = useMeta();
  const s = user.student || {};
  const [f, setF] = useState({ name: user.name, rollNo: s.rollNo || '', branch: s.branch || '', year: s.year || '', batch: s.batch || '', cgpa: s.cgpa ?? '', backlogs: s.backlogs ?? 0, skills: (s.skills || []).join(', '), phone: s.phone || '' });
  const [msg, setMsg] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setError(''); setMsg('');
    try { setUser((await api.put('/profile', { ...f, year: Number(f.year) })).data.user); setMsg('Profile saved'); } catch (x) { setError(errMsg(x)); } finally { setBusy(false); }
  };
  const upload = async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    setError(''); setMsg('');
    if (file.type !== 'application/pdf') return setError('Resume must be a PDF');
    if (file.size > 2 * 1024 * 1024) return setError('Resume must be 2 MB or smaller');
    const fd = new FormData(); fd.append('resume', file);
    try { setUser((await api.post('/profile/resume', fd)).data.user); setMsg('Resume uploaded'); } catch (x) { setError(errMsg(x)); }
  };
  return (<>
    <h1>My profile</h1>
    <ErrorBox error={error} />{msg && <div className="alert ok" role="status">{msg}</div>}
    <form className="card" onSubmit={save}>
      <div className="form-grid">
        <Field label="Full name"><input required value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input value={user.email} disabled /></Field>
        <Field label="Roll number"><input value={f.rollNo} onChange={set('rollNo')} /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Branch"><select value={f.branch} onChange={set('branch')}>{meta?.branches.map((b) => <option key={b}>{b}</option>)}</select></Field>
        <Field label="Year"><select value={f.year} onChange={set('year')}>{meta?.years.map((y) => <option key={y}>{y}</option>)}</select></Field>
        <Field label="Batch"><input value={f.batch} onChange={set('batch')} /></Field>
        <Field label="CGPA (0-10)"><input type="number" step="0.01" min="0" max="10" value={f.cgpa} onChange={set('cgpa')} /></Field>
        <Field label="Active backlogs"><input type="number" min="0" value={f.backlogs} onChange={set('backlogs')} /></Field>
      </div>
      <Field label="Skills" hint="Comma separated, e.g. Java, SQL, React"><input value={f.skills} onChange={set('skills')} /></Field>
      <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
    <div className="card"><h2>Resume (PDF, max 2 MB)</h2>
      {s.resume?.file ? <p>Current: <strong>{s.resume.originalName}</strong> · uploaded {fmt(s.resume.uploadedAt)} <button className="btn sm" onClick={() => download('/profile/resume').catch((x) => setError(errMsg(x)))}>View</button></p> : <p className="muted">No resume uploaded. You need one to apply to drives.</p>}
      <input type="file" accept="application/pdf" onChange={upload} aria-label="Upload resume PDF" />
    </div>
  </>);
}
