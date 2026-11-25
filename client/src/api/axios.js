import axios from 'axios';
import { DEFAULT_API_URL, TOKEN_KEY, USER_KEY } from '../utils/constants';

// Vite can override the API address with VITE_API_URL. Otherwise use localhost.
export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Add the saved token to every request. The server checks this header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function isAuthPage() {
  const path = window.location.pathname;
  if (path === '/login') return true;
  if (path === '/register') return true;
  return false;
}

// A 401 means the saved session has expired. Clear it and go to sign in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!isAuthPage()) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Turn an axios error into a short message we can show in the page.
export function getErrorMessage(error, fallback) {
  const defaultMessage = fallback || 'Something went wrong. Please try again.';
  const data = error.response && error.response.data;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  // Our API sends validation details in an "errors" array.
  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === 'string' && first.trim()) {
      return first;
    }
    if (first && typeof first.message === 'string' && first.message.trim()) {
      return first.message;
    }
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot reach the server. Check your connection and make sure the API is running.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.';
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return defaultMessage;
}

// Keep the HTTP status so pages can recognise a 409 (slot already booked).
export function toAppError(error, fallback) {
  const appError = new Error(getErrorMessage(error, fallback));
  if (error.response) {
    appError.status = error.response.status;
  } else {
    appError.status = 0;
  }
  return appError;
}

export default api;
