import api, { toAppError } from './axios';

// POST /auth/register — the server returns { user, token }.
export async function register(credentials) {
  try {
    const response = await api.post('/auth/register', credentials);
    const body = response.data.data;
    return { token: body.token, user: body.user };
  } catch (error) {
    throw toAppError(error, 'Registration failed. Please try again.');
  }
}

// POST /auth/login — the server returns { user, token }.
export async function login(credentials) {
  try {
    const response = await api.post('/auth/login', credentials);
    const body = response.data.data;
    return { token: body.token, user: body.user };
  } catch (error) {
    throw toAppError(error, 'Unable to sign in. Check your email and password.');
  }
}

// GET /auth/me — the server returns { user }.
export async function getMe() {
  try {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  } catch (error) {
    throw toAppError(error, 'We could not load your account details.');
  }
}

// PUT /auth/profile — the server returns { user }.
export async function updateProfile(updates) {
  try {
    const response = await api.put('/auth/profile', updates);
    return response.data.data.user;
  } catch (error) {
    throw toAppError(error, 'Your profile could not be updated.');
  }
}

const authApi = { register, login, getMe, updateProfile };
export default authApi;
