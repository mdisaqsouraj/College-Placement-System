import { useRef, useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Avatar, Field, ErrorBox } from '../components.jsx';

// Crop to a centred square and shrink to 256x256 so the upload stays tiny.
function toSquareDataUrl(file, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image')); };
    img.src = url;
  });
}

export default function Account() {
  const { user, setUser } = useAuth();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(''), [error, setError] = useState(''), [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const pick = async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    setError(''); setMsg('');
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError('Please choose a JPG, PNG or WebP image');
    if (file.size > 8 * 1024 * 1024) return setError('Image is too large (max 8 MB)');
    try { setUser((await api.put('/profile/avatar', { avatar: await toSquareDataUrl(file) })).data.user); setMsg('Profile picture updated'); } catch (x) { setError(errMsg(x)); }
  };
  const remove = async () => { setError(''); setMsg(''); try { setUser((await api.delete('/profile/avatar')).data.user); setMsg('Profile picture removed'); } catch (x) { setError(errMsg(x)); } };
  const changePw = async (e) => {
    e.preventDefault(); setError(''); setMsg('');
    try { await api.post('/auth/change-password', pw); setPw({ currentPassword: '', newPassword: '' }); setMsg('Password changed'); } catch (x) { setError(errMsg(x)); }
  };
  return (<>
    <h1>My account</h1>
    <ErrorBox error={error} />{msg && <div className="alert ok" role="status">{msg}</div>}
    <div className="card row">
      <Avatar user={user} size={96} />
      <div>
        <h2>{user.name}</h2><div className="muted">{user.email} · {user.role.replace('_', ' ')}</div>
        <div className="row" style={{ marginTop: '.6rem' }}>
          <button className="btn primary" onClick={() => fileRef.current.click()}>{user.avatar ? 'Change picture' : 'Upload picture'}</button>
          {user.avatar && <button className="btn danger" onClick={remove}>Remove</button>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
        </div>
        <small className="muted">Without a picture your initials are shown.</small>
      </div>
    </div>
    <form className="card" onSubmit={changePw}><h2>Change password</h2>
      <div className="form-grid">
        <Field label="Current password"><input type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password" hint="8+ characters, letters and numbers"><input type="password" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
      </div>
      <button className="btn primary">Update password</button>
    </form>
  </>);
}