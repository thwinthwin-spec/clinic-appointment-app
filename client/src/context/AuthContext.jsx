import { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../api/authApi';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

const AuthContext = createContext(null);

// localStorage stores the user as a JSON string, so parse it first.
function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

// Keep the token and user in localStorage so a refresh stays signed in.
function saveSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));
  const [error, setError] = useState('');

  function applySession(nextToken, nextUser) {
    let savedToken = nextToken;
    let savedUser = nextUser;
    if (!savedToken) savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedUser) savedUser = readStoredUser();

    saveSession(savedToken, savedUser);
    setToken(savedToken || null);
    setUser(savedUser || null);
    return savedUser;
  }

  // When the app starts, ask the API for the latest saved user.
  useEffect(() => {
    let active = true;
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    authApi
      .getMe()
      .then((me) => {
        if (active) {
          applySession(savedToken, me);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    setError('');
    setLoading(true);
    try {
      const session = await authApi.login(credentials);
      if (!session.token) {
        throw new Error('The server did not return a valid session token.');
      }

      let resolvedUser = session.user;
      if (!resolvedUser) resolvedUser = await authApi.getMe();

      const savedUser = applySession(session.token, resolvedUser);
      return { token: session.token, user: savedUser };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(details) {
    setError('');
    setLoading(true);
    try {
      const session = await authApi.register(details);
      let savedUser = null;
      let savedToken = null;

      if (session.token) {
        savedToken = session.token;
        savedUser = applySession(session.token, session.user);
      }

      return { token: savedToken, user: savedUser };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    saveSession(null, null);
    setToken(null);
    setUser(null);
    setError('');
  }

  async function updateProfile(updates) {
    setError('');
    try {
      const updated = await authApi.updateProfile(updates);
      const oldUser = readStoredUser();
      const mergedUser = Object.assign({}, oldUser, updated);
      return applySession(localStorage.getItem(TOKEN_KEY), mergedUser);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const value = {
    token: token,
    user: user,
    loading: loading,
    error: error,
    isAuthenticated: Boolean(token && user),
    login: login,
    register: register,
    logout: logout,
    updateProfile: updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}

export default AuthContext;
