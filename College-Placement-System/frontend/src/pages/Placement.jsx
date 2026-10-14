import { useState } from 'react';
import api, { download, errMsg } from '../api.js';
import { useFetch, useMeta, Field, Checks, Loading, ErrorBox, Empty, Badge, Pager, fmt, toLocalInput } from '../components.jsx';

export function Companies() {
  const [page, setPage] = useState(1), [form, setForm] = useState(null), [error, setError] = useState('');
  const { data, loading, error: err, reload } = useFetch(() => api.get(`/companies?page=${page}&limit=20`).then((r) => r.data), [page]);
  const save = async (e) => { e.preventDefault(); setError(''); try { if (form._id) await api.put(`/companies/${form._id}`, form); else await api.post('/companies', form); setForm(null); reload(); } catch (x) { setError(errMsg(x)); } };
  const del = async (id) => { if (!confirm('Delete this company?')) return; try { await api.delete(`/companies/${id}`); reload(); } catch (x) { setError(errMsg(x)); } };
  return (<>
    <div className="row between"><h1>Companies</h1><button className="btn primary" onClick={() => setForm({ name: '', industry: '', website: '', location: '', description: '' })}>+ Add company</button></div>
    <ErrorBox error={err || error} />
    {form && <form className="card" onSubmit={save}><div className="form-grid">
      <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Industry"><input value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
      <Field label="Website"><input value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
      <Field label="Location"><input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field></div>
      <Field label="Description"><textarea rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="row"><button className="btn primary">Save</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div></form>}
    {loading ? <Loading /> : !data.items.length ? <Empty>No companies yet.</Empty> : <div className="card table-wrap"><table><thead><tr><th>Name</th><th>Industry</th><th>Location</th><th>Website</th><th /></tr></thead>
      <tbody>{data.items.map((c) => <tr key={c._id}><td><strong>{c.name}</strong></td><td>{c.industry}</td><td>{c.location}</td><td>{c.website}</td><td className="row"><button className="btn sm" onClick={() => setForm(c)}>Edit</button><button className="btn sm danger" onClick={() => del(c._id)}>Delete</button></td></tr>)}</tbody></table></div>}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}

const blankDrive = { company: '', title: '', role: '', ctcLpa: '', location: '', description: '', deadline: '', driveDate: '', status: 'open', rounds: '', eligibility: { minCgpa: 6, maxBacklogs: 0, branches: [], years: [], requiredSkills: '' } };

export function ManageDrives() {
  const { data: meta } = useMeta();
  const [page, setPage] = useState(1), [form, setForm] = useState(null), [error, setError] = useState('');
  const companies = useFetch(() => api.get('/companies?limit=200').then((r) => r.data.items), []);
  const { data, loading, error: err, reload } = useFetch(() => api.get(`/drives?page=${page}&limit=15`).then((r) => r.data), [page]);
  const edit = (d) => setForm({ ...d, company: d.company?._id, deadline: toLocalInput(d.deadline), driveDate: toLocalInput(d.driveDate), rounds: (d.rounds || []).join(', '), eligibility: { ...d.eligibility, requiredSkills: (d.eligibility.requiredSkills || []).join(', ') } });
  const save = async (e) => {
    e.preventDefault(); setError('');
    const body = { ...form, deadline: form.deadline && new Date(form.deadline).toISOString(), driveDate: form.driveDate ? new Date(form.driveDate).toISOString() : undefined, rounds: form.rounds.split(',').map((s) => s.trim()).filter(Boolean) };
    try { if (form._id) await api.put(`/drives/${form._id}`, body); else await api.post('/drives', body); setForm(null); reload(); } catch (x) { setError(errMsg(x)); }
  };
  const del = async (id) => { if (!confirm('Delete this drive?')) return; try { await api.delete(`/drives/${id}`); reload(); } catch (x) { setError(errMsg(x)); } };
  const el = form?.eligibility, setEl = (patch) => setForm({ ...form, eligibility: { ...el, ...patch } });
  return (<>
    <div className="row between"><h1>Placement drives</h1><button className="btn primary" onClick={() => setForm({ ...blankDrive })}>+ New drive</button></div>
    <ErrorBox error={err || error} />
    {form && <form className="card" onSubmit={save}><h2>{form._id ? 'Edit' : 'New'} drive</h2><div className="form-grid">
      <Field label="Company"><select required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}><option value="">Select…</option>{companies.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
      <Field label="Drive title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
      <Field label="Role"><input value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
      <Field label="CTC (LPA)"><input type="number" min="0" step="0.1" value={form.ctcLpa ?? ''} onChange={(e) => setForm({ ...form, ctcLpa: e.target.value })} /></Field>
      <Field label="Location"><input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
      <Field label="Application deadline"><input required type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
      <Field label="Drive date"><input type="datetime-local" value={form.driveDate} onChange={(e) => setForm({ ...form, driveDate: e.target.value })} /></Field>
      <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>open</option><option>closed</option></select></Field>
      <Field label="Rounds" hint="Comma separated"><input value={form.rounds} onChange={(e) => setForm({ ...form, rounds: e.target.value })} /></Field></div>
      <Field label="Description"><textarea rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <h3>Eligibility rules</h3><div className="form-grid">
        <Field label="Minimum CGPA"><input type="number" step="0.1" min="0" max="10" value={el.minCgpa} onChange={(e) => setEl({ minCgpa: e.target.value })} /></Field>
        <Field label="Max backlogs"><input type="number" min="0" value={el.maxBacklogs} onChange={(e) => setEl({ maxBacklogs: e.target.value })} /></Field>
        <Field label="Required skills" hint="Comma separated"><input value={el.requiredSkills} onChange={(e) => setEl({ requiredSkills: e.target.value })} /></Field></div>
      <Field label="Branches (none = all)"><Checks options={meta?.branches || []} value={el.branches} onChange={(v) => setEl({ branches: v })} /></Field>
      <Field label="Years (none = all)"><Checks options={meta?.years || []} value={el.years} onChange={(v) => setEl({ years: v })} /></Field>
      <div className="row"><button className="btn primary">Save drive</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div></form>}
    {loading ? <Loading /> : !data.items.length ? <Empty>No drives yet. Add a company first, then create a drive.</Empty> : <div className="card table-wrap"><table><thead><tr><th>Company</th><th>Drive</th><th>CTC</th><th>Deadline</th><th>Status</th><th /></tr></thead>
      <tbody>{data.items.map((d) => <tr key={d._id}><td>{d.company?.name}</td><td>{d.title}<br /><small className="muted">{d.role}</small></td><td>{d.ctcLpa ?? '—'}</td><td>{fmt(d.deadline)}</td><td><Badge>{d.status}</Badge></td><td className="row"><button className="btn sm" onClick={() => edit(d)}>Edit</button><button className="btn sm danger" onClick={() => del(d._id)}>Delete</button></td></tr>)}</tbody></table></div>}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}

export function ManageApplications() {
  const { data: meta } = useMeta();
  const [page, setPage] = useState(1), [status, setStatus] = useState(''), [error, setError] = useState(''), [msg, setMsg] = useState('');
  const { data, loading, error: err, reload } = useFetch(() => api.get('/applications', { params: { page, limit: 20, status: status || undefined } }).then((r) => r.data), [page, status]);
  const update = async (a, next) => {
    const note = prompt(`Move to "${next}". Optional note for the student:`); if (note === null) return;
    setError(''); setMsg('');
    try { await api.patch(`/applications/${a._id}/status`, { status: next, note }); setMsg('Status updated and student notified'); reload(); } catch (x) { setError(errMsg(x)); }
  };
  return (<>
    <div className="row between"><h1>Applications</h1><button className="btn" onClick={() => download('/reports/placements.csv', 'placements.csv').catch((x) => setError(errMsg(x)))}>Export placements CSV</button></div>
    <div className="row" style={{ marginBottom: '1rem' }}><select style={{ maxWidth: 200 }} aria-label="Filter by status" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}><option value="">All statuses</option>{meta?.applicationStatuses.map((s) => <option key={s}>{s}</option>)}</select></div>
    <ErrorBox error={err || error} />{msg && <div className="alert ok">{msg}</div>}
    {loading ? <Loading /> : !data.items.length ? <Empty>No applications.</Empty> : <div className="card table-wrap"><table><thead><tr><th>Student</th><th>Branch / CGPA</th><th>Drive</th><th>Status</th><th>Change status</th></tr></thead>
      <tbody>{data.items.map((a) => <tr key={a._id}><td>{a.student?.name}<br /><small className="muted">{a.student?.student?.rollNo}</small></td><td>{a.student?.student?.branch}<br /><small>CGPA {a.student?.student?.cgpa ?? '—'}</small></td><td>{a.drive?.company?.name} — {a.drive?.title}</td><td><Badge>{a.status}</Badge></td>
        <td>{a.status !== 'withdrawn' && <select aria-label="Change status" value="" onChange={(e) => e.target.value && update(a, e.target.value)}><option value="">Move to…</option>{meta?.applicationStatuses.filter((s) => s !== 'withdrawn' && s !== a.status).map((s) => <option key={s}>{s}</option>)}</select>}</td></tr>)}</tbody></table></div>}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}
