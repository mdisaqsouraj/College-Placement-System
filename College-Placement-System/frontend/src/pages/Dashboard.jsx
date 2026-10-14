import { Link } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../auth.jsx';
import { useFetch, Loading, ErrorBox, Empty, Badge, fmt } from '../components.jsx';

function StudentDashboard() {
  const { data: d, loading, error, reload } = useFetch(() => api.get('/reports/student-dashboard').then((r) => r.data), []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (<>
    <h1>My dashboard</h1>
    {d.profileCompleteness < 100 && <div className="alert warn">Your profile is {d.profileCompleteness}% complete. <Link to="/profile">Complete it</Link></div>}
    {d.placed && <div className="alert ok">🎉 Congratulations, you have been selected!</div>}
    <div className="grid">
      <div className="card"><div className="stat">{d.practice.level}</div><div className="stat-l">Practice level · {d.practice.xp} XP</div></div>
      <div className="card"><div className="stat">🔥 {d.practice.streak}</div><div className="stat-l">Day streak</div></div>
      <div className="card"><div className="stat">{d.practice.accuracy ?? '—'}{d.practice.accuracy != null && '%'}</div><div className="stat-l">Practice accuracy</div></div>
      <div className="card"><div className="stat">{Object.values(d.applicationsByStatus).reduce((a, b) => a + b, 0)}</div><div className="stat-l">Applications</div></div>
    </div>
    <div className="grid wide">
      <div className="card"><h2>Upcoming tests</h2>
        {d.upcomingTests.length ? d.upcomingTests.map((t) => <div key={t.id} className="row between"><span><strong>{t.title}</strong><br /><small className="muted">{fmt(t.startTime)} · {t.durationMinutes} min</small></span><Badge>{t.state}</Badge></div>) : <Empty>No upcoming tests</Empty>}
        <Link to="/tests">All tests →</Link></div>
      <div className="card"><h2>Recent official results</h2>
        {d.recentResults.length ? d.recentResults.map((r) => <div key={r.id} className="row between"><Link to={`/attempts/${r.id}/result`}>{r.title}</Link><strong>{r.score}/{r.totalMarks}</strong></div>) : <Empty>No published results yet</Empty>}</div>
    </div>
    <p className="muted">Practice scores are separate from official examination results.</p>
  </>);
}

function StaffDashboard() {
  const { isAdmin, user } = useAuth();
  const { data: d, loading, error, reload } = useFetch(() => api.get('/reports/overview').then((r) => r.data), []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (<>
    <h1>{isAdmin ? 'TPO overview' : 'Coordinator dashboard'}</h1>
    {!isAdmin && <div className="alert ok">Authorised branches: {user.coordinator.branches.join(', ')}{user.coordinator.years?.length ? ` · Years: ${user.coordinator.years.join(', ')}` : ''}</div>}
    <div className="grid">
      <div className="card"><div className="stat">{d.totals.students}</div><div className="stat-l">Students in scope</div></div>
      <div className="card"><div className="stat">{d.totals.placed}</div><div className="stat-l">Placed ({d.totals.placementRate}%)</div></div>
      <div className="card"><div className="stat">{d.totals.applications}</div><div className="stat-l">Applications</div></div>
      <div className="card"><div className="stat">{d.totals.avgCtcLpa ?? '—'}</div><div className="stat-l">Avg CTC (LPA)</div></div>
      <div className="card"><div className="stat">{d.tests.active}/{d.tests.total}</div><div className="stat-l">Active / total tests{d.tests.pendingApproval ? ` · ${d.tests.pendingApproval} pending` : ''}</div></div>
      {d.drives && <div className="card"><div className="stat">{d.drives.open}/{d.drives.total}</div><div className="stat-l">Open / total drives</div></div>}
    </div>
    <div className="card"><h2>Branch-wise placement</h2>
      {d.branchWise.length ? d.branchWise.map((b) => <div key={b.branch} style={{ marginBottom: '.6rem' }}><div className="row between"><span>{b.branch}</span><small>{b.placed}/{b.total}</small></div><div className="bar"><i style={{ width: `${b.total ? (b.placed / b.total) * 100 : 0}%` }} /></div></div>) : <Empty>No students yet</Empty>}</div>
    <div className="card"><h2>Applications by status</h2><div className="row">{Object.entries(d.applicationsByStatus).map(([k, v]) => <span key={k}><Badge>{k}</Badge> {v}</span>)}{!Object.keys(d.applicationsByStatus).length && <span className="muted">None yet</span>}</div></div>
  </>);
}
export const Dashboard = () => (useAuth().isStudent ? <StudentDashboard /> : <StaffDashboard />);
