import { get, post } from './base.js';

async function getAllRegistrationTokens(options) {
  return get('/api/registration-tokens', options);
}

async function createRegistrationToken({ email, firstName, lastName, middleName }, options) {
  const body = { email, firstName, lastName };
  if (middleName) body.middleName = middleName;
  return post('/api/registration-tokens', body, options);
}

async function validateRegistrationToken(token, options) {
  return get(`/api/registration-tokens/${encodeURIComponent(token)}`, options);
}

async function submitRegistration(token, employeeData, options) {
  return post(`/api/registration-tokens/${encodeURIComponent(token)}/submit`, employeeData, options);
}

export {
  getAllRegistrationTokens,
  createRegistrationToken,
  validateRegistrationToken,
  submitRegistration,
}