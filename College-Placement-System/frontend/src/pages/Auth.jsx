import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { errMsg } from '../api.js';
import { ErrorBox, Field, ThemeToggle, useMeta } from '../components.jsx';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login(f.email, f.password); nav('/'); } catch (x) { setError(errMsg(x)); } finally { setBusy(false); }
  };
  return (
      <div className="auth"><div className="row" style={{ justifyContent: 'flex-end', marginBottom: '.5rem' }}><ThemeToggle /></div><div className="card">      <h1>🎓 Placement Portal</h1><p className="muted">Sign in to continue</p>
      <ErrorBox error={error} />
      <form onSubmit={submit}>
        <Field label="Email"><input type="email" required autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p>New student? <Link to="/register">Create an account</Link></p>
    </div></div>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const { data: meta, error: metaError } = useMeta();
  const [f, setF] = useState({ name: '', email: '', password: '', rollNo: '', branch: '', year: '', batch: '' });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await register({ ...f, year: Number(f.year) }); nav('/profile'); } catch (x) { setError(errMsg(x)); } finally { setBusy(false); }
  };
  return (
      <div className="auth"><div className="row" style={{ justifyContent: 'flex-end', marginBottom: '.5rem' }}><ThemeToggle /></div><div className="card">      <h1>Student registration</h1>
      {metaError && <div className="alert warn" role="alert">Cannot reach the server. Start the backend (npm run dev in backend/) before registering.</div>}
      <ErrorBox error={error} />
      <form onSubmit={submit}>
        <Field label="Full name"><input required minLength={2} value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input type="email" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Password" hint="At least 8 characters with letters and numbers"><input type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} /></Field>
        <div className="form-grid">
          <Field label="Roll number"><input value={f.rollNo} onChange={set('rollNo')} /></Field>
          <Field label="Batch (e.g. 2026)"><input value={f.batch} onChange={set('batch')} /></Field>
          <Field label="Branch"><select required value={f.branch} onChange={set('branch')}><option value="">Select…</option>{meta?.branches.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Year"><select required value={f.year} onChange={set('year')}><option value="">Select…</option>{meta?.years.map((y) => <option key={y}>{y}</option>)}</select></Field>
        </div>
        <button className="btn primary" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
      </form>
      <p>Already registered? <Link to="/login">Sign in</Link></p>
    </div></div>
  );
}
