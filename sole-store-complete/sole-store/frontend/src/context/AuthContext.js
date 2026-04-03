// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('sole_user')); } catch { return null; } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sole_token');
    if (token) {
      authAPI.me()
        .then(r => { setUser(r.data.user); localStorage.setItem('sole_user', JSON.stringify(r.data.user)); })
        .catch(() => { localStorage.removeItem('sole_token'); localStorage.removeItem('sole_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  useEffect(() => {
    const h = () => setUser(null);
    window.addEventListener('auth:logout', h);
    return () => window.removeEventListener('auth:logout', h);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('sole_token', data.token);
    localStorage.setItem('sole_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('sole_token', data.token);
    localStorage.setItem('sole_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sole_token');
    localStorage.removeItem('sole_user');
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const res = await authAPI.updateProfile(data);
    localStorage.setItem('sole_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
