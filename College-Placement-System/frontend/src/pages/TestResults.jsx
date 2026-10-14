import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { download, errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useFetch, Loading, ErrorBox, Badge, Pager, Empty, fmt } from '../components.jsx';

export default function TestResults() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1), [error, setError] = useState(''), [msg, setMsg] = useState('');
  const { data, loading, error: err, reload } = useFetch(() => api.get(`/tests/${id}/results`, { params: { page, limit: 25 } }).then((r) => r.data), [id, page]);
  const an = useFetch(() => api.get(`/tests/${id}/analytics`).then((r) => r.data), [id]);
  const release = async () => { try { await api.post(`/tests/${id}/release-results`); setMsg('Results released to students'); reload(); } catch (x) { setError(errMsg(x)); } };
  if (loading) return <Loading />;
  if (err) return <ErrorBox error={err} onRetry={reload} />;
  const s = data.summary;
  return (<>
    <div className="row between"><h1>{data.test.title} — results</h1><Link className="btn" to="/manage/tests">← Tests</Link></div>
    <ErrorBox error={error} />{msg && <div className="alert ok">{msg}</div>}
    <div className="grid">
      {[['Targeted', s.targeted], ['Submitted', s.submitted], ['Not started', s.notStarted], ['Average', s.average ?? '—'], ['Highest', s.highest ?? '—'], ['Lowest', s.lowest ?? '—']].map(([l, v]) => <div className="card" key={l}><div className="stat">{v}</div><div className="stat-l">{l} {l !== 'Targeted' && l !== 'Submitted' && l !== 'Not started' ? `(of ${data.test.totalMarks})` : ''}</div></div>)}
    </div>
    <div className="row" style={{ marginBottom: '1rem' }}>
      <button className="btn primary" onClick={() => download(`/tests/${id}/results.xlsx`, `results-${id}.xlsx`).catch((x) => setError(errMsg(x)))}>Export Excel (.xlsx)</button>
      {data.test.resultPolicy === 'manual' && !data.test.resultsReleased && <button className="btn" onClick={release}>Release results to students</button>}
    </div>
    <div className="card table-wrap"><table>
      <thead><tr><th>Name</th><th>Roll</th><th>Branch</th><th>Status</th><th>Score</th><th>✓</th><th>✗</th><th>—</th><th>Tab exits</th><th>Submitted</th></tr></thead>
      <tbody>{data.items.map((r) => <tr key={r.studentId}><td>{r.name}</td><td>{r.rollNo || '—'}</td><td>{r.branch}</td><td><Badge>{r.status}</Badge></td><td>{r.score ?? '—'}</td><td>{r.correct ?? '—'}</td><td>{r.wrong ?? '—'}</td><td>{r.unanswered ?? '—'}</td><td>{r.tabSwitches ?? '—'}</td><td>{fmt(r.submittedAt)}</td></tr>)}</tbody></table></div>
    <Pager page={data.page} pages={data.pages} onChange={setPage} />
    <div className="card"><h2>Question analysis</h2>
      {an.loading ? <Loading /> : !an.data?.attempts ? <Empty>No submitted attempts yet.</Empty> : <>
        <div className="row">{an.data.distribution.map((b) => <span key={b.range} className="badge">{b.range}: {b.count}</span>)}</div>
        {an.data.questions.map((q, i) => <div key={q.id}><div className="row between"><small>{i + 1}. {q.text.slice(0, 90)}</small><small>{q.correctPercent ?? '—'}% correct ({q.attempted})</small></div><div className="bar"><i style={{ width: `${q.correctPercent || 0}%` }} /></div></div>)}</>}
    </div>
    {!isAdmin && <small className="muted">Showing only students within your authorised scope.</small>}
  </>);
}