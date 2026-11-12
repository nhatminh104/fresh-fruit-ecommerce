import React from 'react';
import * as authService from '../services/authService';
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '../utils/authStorage';

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [initializing, setInitializing] = React.useState(true);

  const loadCurrentUser = React.useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return null;
    }
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  React.useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        const currentUser = await loadCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        clearAuthTokens();
        if (active) setUser(null);
      } finally {
        if (active) setInitializing(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, [loadCurrentUser]);

  React.useEffect(() => {
    const handleExpiredSession = () => {
      clearAuthTokens();
      setUser(null);
    };
    window.addEventListener('auth:logout', handleExpiredSession);
    return () => window.removeEventListener('auth:logout', handleExpiredSession);
  }, []);

  const login = React.useCallback(async (credentials) => {
    const session = await authService.login(credentials);
    setAuthTokens(session);
    setUser(session.user);
    return session.user;
  }, []);

  const register = React.useCallback(async (payload) => {
    const session = await authService.register(payload);
    setAuthTokens(session);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = React.useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Local session is still cleared when the API cannot be reached.
    } finally {
      clearAuthTokens();
      setUser(null);
    }
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      return await loadCurrentUser();
    } catch {
      clearAuthTokens();
      setUser(null);
      return null;
    }
  }, [loadCurrentUser]);

  const value = React.useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, initializing, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
