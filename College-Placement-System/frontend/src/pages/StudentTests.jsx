import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { useFetch, Loading, ErrorBox, Empty, Badge, fmt } from '../components.jsx';

export default function StudentTests() {
  const nav = useNavigate();
  const { data, loading, error, reload } = useFetch(() => api.get('/tests/available').then((r) => r.data), []);
  if (loading) return <Loading />;
  const groups = [
    ['Upcoming & active', data?.items.filter((t) => !t.attempt || t.attempt.status === 'in_progress').filter((t) => t.state !== 'closed')],
    ['Completed', data?.items.filter((t) => t.attempt && t.attempt.status !== 'in_progress')],
    ['Missed / closed', data?.items.filter((t) => t.state === 'closed' && (!t.attempt || t.attempt.status === 'in_progress') && !t.attempt)],
  ];
  return (<>
    <h1>Weekly tests</h1><ErrorBox error={error} onRetry={reload} />
    <p className="muted">Official tests are timed and monitored. The server keeps the master clock and scores your answers.</p>
    {!data?.items.length && <Empty>No tests assigned to you yet.</Empty>}
    {groups.map(([title, list]) => list?.length > 0 && <div key={title}><h2>{title}</h2>
      {list.map((t) => <div className="card" key={t.id}>
        <div className="row between"><h3>{t.title}</h3><Badge>{t.attempt ? t.attempt.status : t.state}</Badge></div>
        <p className="muted">{t.durationMinutes} min · {t.questionCount} questions · {t.totalMarks} marks{t.negativeMarks ? ` · −${t.negativeMarks} per wrong answer` : ''}<br />Window: {fmt(t.startTime)} → {fmt(t.deadline)}</p>
        {t.attempt && t.attempt.status !== 'in_progress' ? <Link className="btn" to={`/attempts/${t.attempt.id}/result`}>View result{t.attempt.score != null ? ` (${t.attempt.score}/${t.totalMarks})` : ''}</Link>
          : <button className="btn primary" disabled={t.state !== 'active'} onClick={() => nav(`/exam/${t.id}`)}>{t.attempt ? 'Resume test' : t.state === 'scheduled' ? 'Not started yet' : 'Start test'}</button>}
      </div>)}</div>)}
  </>);
}
