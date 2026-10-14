import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useFetch, Loading, ErrorBox, Empty, Badge, Pager, fmt } from '../components.jsx';

export default function ManageTests() {
  const { isAdmin, user } = useAuth();
  const [page, setPage] = useState(1), [msg, setMsg] = useState(''), [error, setError] = useState('');
  const { data, loading, error: err, reload } = useFetch(() => api.get(`/tests?page=${page}&limit=15`).then((r) => r.data), [page]);
  const act = async (fn, ok, confirmText) => {
    if (confirmText && !confirm(confirmText)) return;
    setMsg(''); setError('');
    try { await fn(); setMsg(ok); reload(); } catch (x) { setError(errMsg(x)); }
  };
  const canDirect = isAdmin || user.coordinator?.canPublishDirectly;
  return (<>
    <div className="row between"><h1>{isAdmin ? 'All tests' : 'My tests'}</h1>{(isAdmin || user.coordinator?.canCreateTests) && <Link className="btn primary" to="/manage/tests/new">+ New test</Link>}</div>
    <ErrorBox error={err || error} />{msg && <div className="alert ok" role="status">{msg}</div>}
    {loading ? <Loading /> : !data.items.length ? <Empty>No tests yet.</Empty> : <div className="card table-wrap"><table>
      <thead><tr><th>Title</th><th>Status</th><th>Window</th><th>Targets</th><th>Qs / Marks</th>{isAdmin && <th>Created by</th>}<th>Actions</th></tr></thead>
      <tbody>{data.items.map((t) => <tr key={t._id}>
        <td><strong>{t.title}</strong></td><td><Badge>{t.effectiveStatus}</Badge></td>
        <td><small>{fmt(t.startTime)}<br />→ {fmt(t.deadline)}</small></td>
        <td><small>{t.targets.branches.join(', ') || 'All'}{t.targets.years.length ? ` · Y${t.targets.years.join(',')}` : ''}{t.targets.students.length ? ` · +${t.targets.students.length} students` : ''}</small></td>
        <td>{t.questionCount} / {t.totalMarks}</td>{isAdmin && <td>{t.createdBy?.name}</td>}
        <td><div className="row">
          {t.status === 'draft' && <><Link className="btn sm" to={`/manage/tests/${t._id}/edit`}>Edit</Link>
            <button className="btn sm primary" onClick={() => act(() => api.post(`/tests/${t._id}/publish`), canDirect ? 'Test published' : 'Sent for TPO approval', canDirect ? 'Publish and notify targeted students?' : 'Request TPO approval?')}>{canDirect ? 'Publish' : 'Request approval'}</button>
            <button className="btn sm danger" onClick={() => act(() => api.delete(`/tests/${t._id}`), 'Deleted', 'Delete this draft?')}>Delete</button></>}
          {t.status === 'pending_approval' && isAdmin && <><button className="btn sm primary" onClick={() => act(() => api.post(`/tests/${t._id}/approve`), 'Approved and published', 'Approve and publish?')}>Approve</button>
            <button className="btn sm danger" onClick={() => { const note = prompt('Reason for rejection (optional)') ?? null; if (note !== null) act(() => api.post(`/tests/${t._id}/reject`, { note }), 'Rejected'); }}>Reject</button></>}
          {t.status === 'published' && <button className="btn sm danger" onClick={() => act(() => api.post(`/tests/${t._id}/close`), 'Test closed', 'Close now? Running attempts will be finalised.')}>Close</button>}
          {['published', 'closed'].includes(t.status) && <Link className="btn sm" to={`/manage/tests/${t._id}/results`}>Results</Link>}
        </div></td></tr>)}</tbody></table></div>}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}
