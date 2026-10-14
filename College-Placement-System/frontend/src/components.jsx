import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import api, { errMsg } from './api.js';

export function useFetch(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true, error: '' });
  const load = useCallback(async () => {
    set((s) => ({ ...s, loading: true, error: '' }));
    try { set({ data: await fn(), loading: false, error: '' }); } catch (e) { set({ data: null, loading: false, error: errMsg(e) }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

export const Loading = ({ text = 'Loading…' }) => <div className="center muted" role="status">{text}</div>;
export const ErrorBox = ({ error, onRetry }) => error ? <div className="alert error" role="alert">{error}{onRetry && <button className="btn sm" onClick={onRetry}>Retry</button>}</div> : null;
export const Empty = ({ children = 'Nothing here yet.' }) => <div className="empty">{children}</div>;
export const Badge = ({ children, tone }) => <span className={`badge ${tone || String(children).toLowerCase().replace(/[^a-z]+/g, '-')}`}>{String(children).replace(/_/g, ' ')}</span>;
export const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
export const toLocalInput = (d) => { if (!d) return ''; const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };

export function Pager({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return <div className="pager"><button className="btn sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ Prev</button><span>Page {page} of {pages}</span><button className="btn sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next ›</button></div>;
}

export function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small className="muted">{hint}</small>}</label>;
}

export function Checks({ options, value = [], onChange }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return <div className="checks">{options.map((o) => <label key={o} className="check"><input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} /> {String(o)}</label>)}</div>;
}

// Built-in fallback so dropdowns are never empty, even if the API is unreachable.
const FALLBACK_META = {
  branches: ['Computer Engineering', 'Information Technology', 'Electronics & Telecom', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
  years: [1, 2, 3, 4],
  categories: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation'],
  difficulties: ['easy', 'medium', 'hard'],
  applicationStatuses: ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected', 'withdrawn'],
};
export function useMeta() {
  const r = useFetch(() => api.get('/meta').then((x) => x.data), []);
  return { ...r, data: r.data || FALLBACK_META };
}

export function Avatar({ user, size = 40 }) {
  const name = user?.name || '?';
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);
  const box = { width: size, height: size };
  return user?.avatar
    ? <img className="avatar" src={user.avatar} alt={name} style={box} />
    : <span className="avatar" role="img" aria-label={name} style={{ ...box, fontSize: size * 0.4, background: `hsl(${hue} 55% 42%)` }}>{initials}</span>;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'light');
  const toggle = () => { const next = theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; localStorage.setItem('theme', next); setTheme(next); };
  return <button type="button" className="btn sm" onClick={toggle} aria-label="Switch between light and dark mode">{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>;
}

export function Protected({ allow }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (allow && !allow(user)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function Layout() {
  const { user, logout, isStudent, isAdmin, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  const { data } = useFetch(() => api.get('/notifications?limit=1').then((r) => r.data), [loc.pathname]);
  const links = isStudent
    ? [['/', 'Dashboard'], ['/profile', 'My Profile'], ['/drives', 'Placement Drives'], ['/applications', 'My Applications'], ['/tests', 'Weekly Tests'], ['/practice', 'Aptitude Practice']]
    : [['/', 'Dashboard'], ...(isStaff ? [['/students', 'Students'], ['/manage/tests', 'Tests'], ['/manage/questions', 'Question Bank']] : []),
       ...(isAdmin ? [['/manage/companies', 'Companies'], ['/manage/drives', 'Drives'], ['/manage/applications', 'Applications'], ['/admin/members', 'Coordinators'], ['/admin/audit', 'Audit Log']] : [])];
  return (
    <div className="shell">
      <button className="menu-btn" aria-label="Toggle menu" onClick={() => setOpen(!open)}>☰</button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">🎓 Placement Portal</div>
        <nav aria-label="Main">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>)}
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>Notifications {data?.unread > 0 && <span className="pill">{data.unread}</span>}</NavLink>
        </nav>
        <div className="userbox">
          <Link to="/account" className="userlink"><Avatar user={user} size={40} /><span><strong>{user.name}</strong><small>{user.role.replace('_', ' ')}</small></span></Link>
          <div className="row"><ThemeToggle /><button className="btn sm" onClick={logout}>Log out</button></div>
        </div>      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}
