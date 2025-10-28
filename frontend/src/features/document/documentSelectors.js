const base = (state) => state.documents || {};

export const selectMyDocuments = (state) => base(state).my?.items || [];
export const selectMyDocumentsStatus = (state) => base(state).my?.status || 'idle';
export const selectMyDocumentsError = (state) => base(state).my?.error || null;

export const selectMyUploadStatus = (state) => base(state).my?.uploadStatus || 'idle';
export const selectMyUploadError = (state) => base(state).my?.uploadError || null;

export const selectEmployeeDocuments = (state, employeeId) =>
  base(state).byEmployee?.[employeeId]?.items || [];
export const selectEmployeeDocumentsStatus = (state, employeeId) =>
  base(state).byEmployee?.[employeeId]?.status || 'idle';
export const selectEmployeeDocumentsError = (state, employeeId) =>
  base(state).byEmployee?.[employeeId]?.error || null;

export const selectDocumentReviewStatus = (state) => base(state).review?.status || 'idle';
export const selectDocumentReviewError = (state) => base(state).review?.error || null;

export const selectPreview = (state) => base(state).preview || { url: null, status: 'idle' };
export const selectDownloadStatus = (state) => base(state).download?.status || 'idle';
export const selectDownloadError = (state) => base(state).download?.error || null;