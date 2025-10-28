import { get, post, put } from './base.js';

const ONBOARDING_REVIEW_STATUSES = ['pending', 'approved', 'rejected'];

async function getMyProfile(options) {
  return get('/api/employees/me', options); 
}

async function updateMyProfile(updateData, options) {
  return put('/api/employees/me', updateData, options); 
}

async function getOnboardingStatus(options) {
  return get('/api/employees/onboarding-status', options); 
}

async function getAllOnboardingApplications({ status } = {}, options) {
  return get('/api/employees/onboarding/review', { ...options, query: { status } }); 
}

async function viewOnboardingApplication(employeeId, options) {
  return get(`/api/employees/onboarding/review/${employeeId}`, options); 
}

async function reviewOnboardingApplication(employeeId, { status, hrFeedback }, options) {
  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Status must be "approved" or "rejected"');
  }
  if (status === 'rejected' && !hrFeedback) {
    throw new Error('Feedback is required when rejecting');
  }
  return put(`/api/employees/onboarding/review/${employeeId}`, { status, hrFeedback }, options); 
}

async function getAllEmployees({ page, limit, search, status } = {}, options) {
  return get('/api/employees', { ...options, query: { page, limit, search, status } }); 
}

async function getEmployeeById(employeeId, options) {
  return get(`/api/employees/${employeeId}`, options); 
}

async function getAllVisaStatusEmployees({ page, limit, search } = {}, options) {
  return get('/api/employees/visa-status', { ...options, query: { page, limit, search } }); 
}

async function getEmployeesWithIncompleteOptDocs({ page, limit, search } = {}, options) {
  return get('/api/employees/visa-status/in-progress', { ...options, query: { page, limit, search } }); 
}

async function getPendingVisaDocuments(employeeId, options) {
  return get(`/api/employees/visa-status/document/${employeeId}`, options);
}

async function reviewVisaDocument(docId, { status, feedback }, options) {
  if (!status) throw new Error('Status is required');
  return put(`/api/employees/visa-status/document/${docId}/review`, { status, feedback }, options); 
}

async function sendNextStepReminder(employeeId, options) {
  return post(`/api/employees/visa-status/notify/${employeeId}`, {}, options); 
}

export {
  ONBOARDING_REVIEW_STATUSES,
  getMyProfile,
  updateMyProfile,
  getOnboardingStatus,
  getAllOnboardingApplications,
  viewOnboardingApplication,
  reviewOnboardingApplication,
  getAllEmployees,
  getEmployeeById,
  getAllVisaStatusEmployees,
  getEmployeesWithIncompleteOptDocs,
  getPendingVisaDocuments,
  reviewVisaDocument,
  sendNextStepReminder,
};