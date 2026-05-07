import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { storageKeys } from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem(storageKeys.auth);
    const storedToken = localStorage.getItem(storageKeys.token);
    try {
      if (!storedAuth) {
        setToken(storedToken ?? null);
        return;
      }
      const parsed = JSON.parse(storedAuth);
      setUser(parsed.user ?? null);
      setToken(parsed.token ?? storedToken ?? null);
    } catch {
      localStorage.removeItem(storageKeys.auth);
      localStorage.removeItem(storageKeys.token);
    }
  }, []);

  const login = (authPayload) => {
    const nextUser = authPayload?.user ?? null;
    const nextToken = authPayload?.token ?? null;
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(
      storageKeys.auth,
      JSON.stringify({ user: nextUser, token: nextToken })
    );
    if (nextToken) {
      localStorage.setItem(storageKeys.token, nextToken);
    } else {
      localStorage.removeItem(storageKeys.token);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(storageKeys.auth);
    localStorage.removeItem(storageKeys.token);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
