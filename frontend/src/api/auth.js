import { get, post, setToken, clearToken, getToken } from './base.js';

async function login({ username, password }) {
  const data = await post('/api/auth/login', { username, password });
  if (data?.token) setToken(data.token);
  return data;
}

async function getMe(options) {
  return get('/api/auth/me', options);
}

function logout() {
  clearToken();
}

function isAuthenticated() {
  return !!getToken();
}

export { login, getMe, logout, isAuthenticated };