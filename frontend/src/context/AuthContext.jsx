import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api.js';
import { storageKeys } from '../utils/storage.js';

const AuthContext = createContext(null);
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const timeoutRef = useRef(null);

  const persistAuth = ({ nextUser, nextToken, nextRefreshToken }) => {
    setUser(nextUser);
    setToken(nextToken);
    setRefreshToken(nextRefreshToken || null);

    localStorage.setItem(
      storageKeys.auth,
      JSON.stringify({
        user: nextUser,
        token: nextToken,
        refreshToken: nextRefreshToken || null,
      })
    );

    if (nextToken) {
      localStorage.setItem(storageKeys.token, nextToken);
    } else {
      localStorage.removeItem(storageKeys.token);
    }

    if (nextRefreshToken) {
      localStorage.setItem(storageKeys.refreshToken, nextRefreshToken);
    } else {
      localStorage.removeItem(storageKeys.refreshToken);
    }
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem(storageKeys.auth);
    const storedToken = localStorage.getItem(storageKeys.token);
    const storedRefresh = localStorage.getItem(storageKeys.refreshToken);
    try {
      if (!storedAuth && !storedToken) {
        return;
      }
      const parsed = storedAuth ? JSON.parse(storedAuth) : {};
      const nextToken = parsed.token ?? storedToken ?? null;
      const nextRefresh = parsed.refreshToken ?? storedRefresh ?? null;
      setUser(parsed.user ?? null);
      setToken(nextToken);
      setRefreshToken(nextRefresh);

      if (!nextToken) return;

      const refreshUser = async () => {
        try {
          const response = await api.get('/auth/me');
          const freshUser = response?.data?.data;
          if (!freshUser) return;
          persistAuth({
            nextUser: freshUser,
            nextToken: localStorage.getItem(storageKeys.token) || nextToken,
            nextRefreshToken:
              localStorage.getItem(storageKeys.refreshToken) || nextRefresh,
          });
        } catch {
          // Keep cached auth if /auth/me is temporarily unavailable.
        }
      };

      refreshUser();
    } catch {
      localStorage.removeItem(storageKeys.auth);
      localStorage.removeItem(storageKeys.token);
      localStorage.removeItem(storageKeys.refreshToken);
    }
  }, []);

  const login = (authPayload) => {
    const nextUser = authPayload?.user ?? null;
    const nextToken = authPayload?.accessToken || authPayload?.token || null;
    const nextRefreshToken = authPayload?.refreshToken || null;
    persistAuth({ nextUser, nextToken, nextRefreshToken });
  };

  const logout = async () => {
    try {
      if (localStorage.getItem(storageKeys.token)) {
        await api.post('/auth/logout');
      }
    } catch {
      // Clear local session even if API logout fails.
    }

    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem(storageKeys.auth);
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.refreshToken);
  };

  useEffect(() => {
    if (!token) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return undefined;
    }

    const inactivityTimeoutMs = Number(
      import.meta.env.VITE_INACTIVITY_TIMEOUT_MS || DEFAULT_TIMEOUT_MS
    );

    const resetInactivityTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        logout();
      }, inactivityTimeoutMs);
    };

    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, resetInactivityTimer, { passive: true })
    );
    resetInactivityTimer();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      ACTIVITY_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, resetInactivityTimer)
      );
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      refreshToken,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [user, token, refreshToken]
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
