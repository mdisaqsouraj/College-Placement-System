import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { useFetch, Loading, ErrorBox, Empty, Pager, fmt } from '../components.jsx';

export default function Notifications() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => api.get(`/notifications?page=${page}&limit=20`).then((r) => r.data), [page]);
  const read = async (id) => { await api.patch(`/notifications/${id}/read`); reload(); };
  const readAll = async () => { await api.post('/notifications/read-all'); reload(); };
  return (<>
    <div className="row between"><h1>Notifications</h1><button className="btn" onClick={readAll} disabled={!data?.unread}>Mark all read</button></div>
    <ErrorBox error={error} />
    {loading ? <Loading /> : !data.items.length ? <Empty>You're all caught up.</Empty> : data.items.map((n) => (
      <div key={n._id} className="card" style={{ opacity: n.read ? 0.65 : 1 }}>
        <div className="row between"><strong>{n.title}</strong><small className="muted">{fmt(n.createdAt)}</small></div>
        <div>{n.message}</div>
        <div className="row">{n.link && <Link to={n.link}>Open</Link>}{!n.read && <button className="btn sm" onClick={() => read(n._id)}>Mark read</button>}</div>
      </div>))}
    {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
  </>);
}
