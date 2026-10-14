import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  const refresh = useCallback(async () => {
    try { setUser((await api.get('/auth/me')).data.user); } catch { localStorage.removeItem('token'); setUser(null); } finally { setLoading(false); }
  }, []);
  useEffect(() => { if (localStorage.getItem('token')) refresh(); }, [refresh]);

  const start = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); };
  const login = async (email, password) => start((await api.post('/auth/login', { email, password })).data);
  const register = async (body) => start((await api.post('/auth/register', body)).data);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  const role = user?.role;
  const isStudent = role === 'student';
  const isAdmin = role === 'tpo_admin';
  const isDelegate = (role === 'tpo_member' || role === 'faculty') && !!user?.coordinator?.active;
  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh, setUser, isStudent, isAdmin, isDelegate, isStaff: isAdmin || isDelegate }}>{children}</Ctx.Provider>;
}
