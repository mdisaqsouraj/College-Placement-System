import { useState } from 'react';
import api, { errMsg } from '../api.js';
import { useFetch, Loading, ErrorBox, Empty, Badge, Pager, fmt } from '../components.jsx';

export function StudentDrives() {
  const [page, setPage] = useState(1), [msg, setMsg] = useState(''), [error, setError] = useState('');
  const { data, loading, error: err, reload } = useFetch(() => api.get(`/drives?page=${page}&limit=10`).then((r) => r.data), [page]);
  const apply = async (id) => {
    setMsg(''); setError('');
    try { await api.post('/applications', { driveId: id }); setMsg('Application submitted'); reload(); }
    catch (x) { setError(errMsg(x) + (x.response?.data?.reasons ? ': ' + x.response.data.reasons.join('; ') : '')); }
  };
  return (<>
    <h1>Placement drives</h1>
    <ErrorBox error={err || error} />{msg && <div className="alert ok" role="status">{msg}</div>}
    {loading ? <Loading /> : !data.items.length ? <Empty>No drives published yet.</Empty> : data.items.map((d) => (
      <div className="card" key={d._id}>
        <div className="row between"><h2>{d.company?.name} — {d.title}</h2><Badge>{d.open ? 'open' : 'closed'}</Badge></div>
        <p className="muted">{d.role} · {d.ctcLpa ? `${d.ctcLpa} LPA` : 'CTC n/a'} · {d.location || 'Location n/a'} · Apply by {fmt(d.deadline)}</p>
        {d.description && <p>{d.description}</p>}
        <p><small>Eligibility: CGPA ≥ {d.eligibility.minCgpa} · Backlogs ≤ {d.eligibility.maxBacklogs} · {d.eligibility.branches.length ? d.eligibility.branches.join(', ') : 'All branches'}{d.eligibility.requiredSkills.length ? ` · Skills: ${d.eligibility.requiredSkills.join(', ')}` : ''}</small></p>
        {d.eligibility_result.eligible ? <div className="alert ok">✓ You are eligible</div> : <div className="alert warn"><span>✗ Not eligible: {d.eligibility_result.reasons.join('; ')}</span></div>}
        {d.application ? <Badge>{d.application.status}</Badge> : <button className="btn primary" disabled={!d.open || !d.eligibility_result.eligible} onClick={() => apply(d._id)}>Apply</button>}
      </div>))}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}

export function MyApplications() {
  const [error, setError] = useState('');
  const { data, loading, error: err, reload } = useFetch(() => api.get('/applications/mine').then((r) => r.data), []);
  const withdraw = async (id) => { if (!confirm('Withdraw this application?')) return; try { await api.post(`/applications/${id}/withdraw`); reload(); } catch (x) { setError(errMsg(x)); } };
  return (<>
    <h1>My applications</h1><ErrorBox error={err || error} />
    {loading ? <Loading /> : !data.items.length ? <Empty>You have not applied to any drive yet.</Empty> : (
      <div className="card table-wrap"><table><thead><tr><th>Company</th><th>Drive</th><th>Applied</th><th>Status</th><th>History</th><th /></tr></thead><tbody>
        {data.items.map((a) => <tr key={a._id}><td>{a.drive?.company?.name}</td><td>{a.drive?.title}</td><td>{fmt(a.createdAt)}</td><td><Badge>{a.status}</Badge></td>
          <td><small>{a.history.map((h) => `${h.status}${h.note ? ` (${h.note})` : ''}`).join(' → ')}</small></td>
          <td>{['applied', 'shortlisted'].includes(a.status) && <button className="btn sm danger" onClick={() => withdraw(a._id)}>Withdraw</button>}</td></tr>)}
      </tbody></table></div>)}
  </>);
}
