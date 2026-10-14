import { useState } from 'react';
import api, { download, errMsg } from '../api.js';
import { useFetch, useMeta, Loading, ErrorBox, Empty, Pager } from '../components.jsx';

export default function Students() {
  const { data: meta } = useMeta();
  const [q, setQ] = useState({ search: '', branch: '', year: '' }), [applied, setApplied] = useState(q), [page, setPage] = useState(1), [err, setErr] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/students', { params: { ...applied, page, limit: 20 } }).then((r) => r.data), [applied, page]);
  return (<>
    <h1>Students</h1>
    <p className="muted">You only see students inside your authorised branches and years.</p>
    <form className="card row" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(q); }}>
      <input style={{ maxWidth: 260 }} placeholder="Search name, email, roll no" aria-label="Search" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value })} />
      <select style={{ maxWidth: 220 }} aria-label="Branch" value={q.branch} onChange={(e) => setQ({ ...q, branch: e.target.value })}><option value="">All branches</option>{meta?.branches.map((b) => <option key={b}>{b}</option>)}</select>
      <select style={{ maxWidth: 120 }} aria-label="Year" value={q.year} onChange={(e) => setQ({ ...q, year: e.target.value })}><option value="">All years</option>{meta?.years.map((y) => <option key={y}>{y}</option>)}</select>
      <button className="btn primary">Filter</button>
    </form>
    <ErrorBox error={error || err} onRetry={reload} />
    {loading ? <Loading /> : !data.items.length ? <Empty>No students found.</Empty> : <div className="card table-wrap"><table>
      <thead><tr><th>Name</th><th>Roll</th><th>Branch</th><th>Year</th><th>CGPA</th><th>Backlogs</th><th>Skills</th><th>Resume</th></tr></thead>
      <tbody>{data.items.map((s) => <tr key={s.id}><td>{s.name}<br /><small className="muted">{s.email}</small></td><td>{s.rollNo || '—'}</td><td>{s.branch}</td><td>{s.year}</td><td>{s.cgpa ?? '—'}</td><td>{s.backlogs ?? 0}</td><td>{(s.skills || []).join(', ')}</td>
        <td>{s.hasResume ? <button className="btn sm" onClick={() => download(`/students/${s.id}/resume`).catch((x) => setErr(errMsg(x)))}>View</button> : '—'}</td></tr>)}</tbody></table></div>}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}
