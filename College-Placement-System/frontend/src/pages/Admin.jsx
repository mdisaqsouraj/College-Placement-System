import { useState } from 'react';
import api, { errMsg } from '../api.js';
import { useFetch, useMeta, Field, Checks, Loading, ErrorBox, Empty, Badge, Pager, fmt } from '../components.jsx';

const blank = { name: '', email: '', password: '', role: 'tpo_member', coordinator: { memberYear: 3, branches: [], years: [], canCreateTests: true, canPublishDirectly: false, canViewResults: true } };

export function Members() {
  const { data: meta } = useMeta();
  const { data, loading, error: err, reload } = useFetch(() => api.get('/admin/members').then((r) => r.data), []);
  const [form, setForm] = useState(null), [error, setError] = useState(''), [msg, setMsg] = useState('');
  const c = form?.coordinator, setC = (p) => setForm({ ...form, coordinator: { ...c, ...p } });
  const edit = (m) => setForm({ _id: m._id, name: m.name, email: m.email, role: m.role, coordinator: { ...blank.coordinator, ...m.coordinator } });
  const save = async (e) => {
    e.preventDefault(); setError(''); setMsg('');
    try {
      if (form._id) await api.put(`/admin/members/${form._id}/permissions`, form.coordinator);
      else await api.post('/admin/members', form);
      setForm(null); setMsg('Permissions saved and the member was notified'); reload();
    } catch (x) { setError(errMsg(x)); }
  };
  const revoke = async (m) => { if (!confirm(`Revoke all test-management access for ${m.name}?`)) return; try { await api.delete(`/admin/members/${m._id}/permissions`); setMsg('Access revoked'); reload(); } catch (x) { setError(errMsg(x)); } };
  return (<>
    <div className="row between"><h1>Delegated coordinators</h1><button className="btn primary" onClick={() => setForm(structuredClone(blank))}>+ Authorise member</button></div>
    <p className="muted">Coordinators can create and distribute tests only for their authorised branches/years. Every grant and revoke is written to the audit log.</p>
    <ErrorBox error={err || error} />{msg && <div className="alert ok" role="status">{msg}</div>}
    {form && <form className="card" onSubmit={save}><h2>{form._id ? `Edit permissions: ${form.name}` : 'Authorise a third-year TPO member / faculty'}</h2>
      {!form._id && <div className="form-grid">
        <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Initial password" hint="Share securely; at least 8 characters with letters and numbers"><input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="Role"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="tpo_member">TPO member (third year)</option><option value="faculty">Faculty coordinator</option></select></Field></div>}
      {form.role === 'tpo_member' && <Field label="Member's year of study" hint="Must be 3"><input type="number" style={{ maxWidth: 100 }} value={c.memberYear} onChange={(e) => setC({ memberYear: e.target.value })} /></Field>}
      <Field label="Authorised branches"><Checks options={meta?.branches || []} value={c.branches} onChange={(v) => setC({ branches: v })} /></Field>
      <Field label="Authorised student years (none = all years)"><Checks options={meta?.years || []} value={c.years} onChange={(v) => setC({ years: v })} /></Field>
      <div className="checks">
        <label className="check"><input type="checkbox" checked={c.canCreateTests} onChange={(e) => setC({ canCreateTests: e.target.checked })} /> Can create tests</label>
        <label className="check"><input type="checkbox" checked={c.canPublishDirectly} onChange={(e) => setC({ canPublishDirectly: e.target.checked })} /> Can publish without TPO approval</label>
        <label className="check"><input type="checkbox" checked={c.canViewResults} onChange={(e) => setC({ canViewResults: e.target.checked })} /> Can view branch results</label></div>
      <div className="row" style={{ marginTop: '.8rem' }}><button className="btn primary">Save</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div></form>}
    {loading ? <Loading /> : !data.items.length ? <Empty>No delegated members yet.</Empty> : <div className="card table-wrap"><table><thead><tr><th>Member</th><th>Role</th><th>Branches</th><th>Years</th><th>Rights</th><th>Status</th><th /></tr></thead>
      <tbody>{data.items.map((m) => <tr key={m._id}><td>{m.name}<br /><small className="muted">{m.email}</small></td><td>{m.role.replace('_', ' ')}</td><td>{m.coordinator?.branches?.join(', ')}</td><td>{m.coordinator?.years?.join(', ') || 'All'}</td>
        <td><small>{m.coordinator?.canCreateTests ? 'create · ' : ''}{m.coordinator?.canPublishDirectly ? 'publish · ' : 'needs approval · '}{m.coordinator?.canViewResults ? 'results' : ''}</small></td>
        <td><Badge>{m.coordinator?.active ? 'active' : 'revoked'}</Badge></td>
        <td className="row"><button className="btn sm" onClick={() => edit(m)}>Edit</button>{m.coordinator?.active && <button className="btn sm danger" onClick={() => revoke(m)}>Revoke</button>}</td></tr>)}</tbody></table></div>}
  </>);
}

export function AuditLogs() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => api.get(`/admin/audit-logs?page=${page}&limit=25`).then((r) => r.data), [page]);
  return (<>
    <h1>Audit log</h1><ErrorBox error={error} onRetry={reload} />
    {loading ? <Loading /> : !data.items.length ? <Empty>No privileged actions recorded yet.</Empty> : <div className="card table-wrap"><table><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th>Details</th><th>IP</th></tr></thead>
      <tbody>{data.items.map((l) => <tr key={l._id}><td>{fmt(l.createdAt)}</td><td>{l.actor?.name || '—'}<br /><small className="muted">{l.actorRole}</small></td><td><code>{l.action}</code></td><td><small>{l.targetType} {l.targetId?.slice(-6)}</small></td><td><small>{l.details ? JSON.stringify(l.details).slice(0, 120) : ''}</small></td><td><small>{l.ip}</small></td></tr>)}</tbody></table></div>}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}
