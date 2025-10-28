const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001').replace(/\/+$/, '');
const TOKEN_KEY = 'auth_token';

class ApiError extends Error {
  constructor(message, { status, data }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

async function apiFetch(path, options = {}) {
  const { method = 'GET', headers = {}, body, token, query, signal } = options;

  let url = path.startsWith('http')
    ? path
    : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  if (query && Object.keys(query).length) {
    const u = new URL(url);
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) u.searchParams.append(k, v);
    });
    url = u.toString();
  }

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');

  const authToken = token ?? getToken();
  if (authToken) finalHeaders.set('Authorization', `Bearer ${authToken}`);

  let bodyToSend = body;
  if (body instanceof FormData) {
    // Let the browser set the Content-Type boundary
  } else if (body !== undefined && body !== null) {
    finalHeaders.set('Content-Type', 'application/json');
    bodyToSend = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers: finalHeaders, body: bodyToSend, signal });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (isJson && data && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, { status: res.status, data });
  }

  return data;
}

const get = (path, opts) => apiFetch(path, { ...opts, method: 'GET' });
const post = (path, body, opts) => apiFetch(path, { ...opts, method: 'POST', body });
const put = (path, body, opts) => apiFetch(path, { ...opts, method: 'PUT', body });
const patch = (path, body, opts) => apiFetch(path, { ...opts, method: 'PATCH', body });
const del = (path, opts) => apiFetch(path, { ...opts, method: 'DELETE' });

export {
  BASE_URL,
  TOKEN_KEY,
  ApiError,
  apiFetch,
  get,
  post,
  put,
  patch,
  del,
  getToken,
  setToken,
  clearToken,
};