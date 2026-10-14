import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useFetch, Loading, ErrorBox, Badge, fmt } from '../components.jsx';

export default function AttemptResult() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => api.get(`/attempts/${id}`).then((r) => r.data), [id]);
  const [review, setReview] = useState(null), [rErr, setRErr] = useState('');
  const loadReview = async () => { setRErr(''); try { setReview((await api.get(`/attempts/${id}/review`)).data.items); } catch (x) { setRErr(errMsg(x)); } };
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const r = data.result;
  return (<>
    <h1>{data.title}</h1>
    <div className="card">
      <div className="row between"><Badge>{data.status}</Badge><small className="muted">Submitted {fmt(data.submittedAt)}{data.finalizeReason ? ` · via ${data.finalizeReason.replace('_', ' ')}` : ''}</small></div>
      {r ? <>
        <div className="stat">{r.score} / {r.totalMarks}</div>
        <p>Correct: <strong>{r.correct}</strong> · Wrong: <strong>{r.wrong}</strong> · Unanswered: <strong>{r.unanswered}</strong></p>
      </> : <div className="alert warn">{data.message}</div>}
      <div className="row"><Link className="btn" to="/tests">Back to tests</Link>{data.reviewAvailable && !review && <button className="btn primary" onClick={loadReview}>Review answers</button>}</div>
      <ErrorBox error={rErr} />
    </div>
    {review && review.map((q, i) => (
      <div className="card" key={q.id}>
        <strong>{i + 1}. {q.text}</strong>
        {q.options.map((o) => <div key={o.id} className={`opt ${o.id === q.correctOptionId ? 'right' : o.id === q.selectedOptionId ? 'wrong' : ''}`}>{o.text}{o.id === q.selectedOptionId && ' (your answer)'}{o.id === q.correctOptionId && ' ✓'}</div>)}
        {q.explanation && <p className="muted">{q.explanation}</p>}
      </div>))}
  </>);
}
