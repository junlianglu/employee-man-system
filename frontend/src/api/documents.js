import { BASE_URL, getToken, get, post, put } from './base.js';

const ALLOWED_TYPES = [
  'profile_picture', 'drivers_license', 'work_authorization',
  'opt_receipt', 'opt_ead', 'i983', 'i20'
];

async function fetchBlob(path, { method = 'GET', signal } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', '*/*');

  const res = await fetch(url, { method, headers, signal });
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let message = `Request failed with status ${res.status}`;
    try {
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data?.error || data?.message) message = data.error || data.message;
      } else {
        const text = await res.text();
        if (text) message = text;
      }
    } catch {
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const blob = await res.blob();
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const cd = res.headers.get('content-disposition') || '';
  const match = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const filename = match ? decodeURIComponent(match[1]) : 'document';

  return { blob, contentType, filename };
}


async function getMyDocuments(options) {

  return get('/api/documents/me', options);
}


async function getEmployeeDocuments(employeeId, options) {
  return get(`/api/documents/${employeeId}`, options);
}

async function uploadDocument({ type, file }, options) {
  if (!type) throw new Error('Document type is required');
  if (!ALLOWED_TYPES.includes(type)) throw new Error('Invalid document type');
  if (!file) throw new Error('File is required');

  const form = new FormData();
  form.append('type', type);
  form.append('file', file);

  return post('/api/documents/upload', form, options);
}

async function reviewDocument(docId, { status, hrFeedback }, options) {
  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Status must be "approved" or "rejected"');
  }
  return put(`/api/documents/review/${docId}`, { status, hrFeedback }, options);
}

async function viewDocument(docId, options) {
  return fetchBlob(`/api/documents/view/${docId}`, { method: 'GET', ...options });
}
async function downloadDocument(docId, options) {
  return fetchBlob(`/api/documents/download/${docId}`, { method: 'GET', ...options });
}

async function hrViewDocument(docId, options) {
  return fetchBlob(`/api/documents/hr/view/${docId}`, { method: 'GET', ...options });
}
async function hrDownloadDocument(docId, options) {
  return fetchBlob(`/api/documents/hr/download/${docId}`, { method: 'GET', ...options });
}

export {
  ALLOWED_TYPES,
  getMyDocuments,
  getEmployeeDocuments,
  uploadDocument,
  reviewDocument,
  viewDocument,
  downloadDocument,
  hrViewDocument,
  hrDownloadDocument,
};