const base = (state) => state.employee || {};

// My profile
export const selectMyProfile = (state) => base(state).myProfile?.data || null;
export const selectMyProfileStatus = (state) => base(state).myProfile?.status || 'idle';
export const selectMyProfileError = (state) => base(state).myProfile?.error || null;
export const selectMyProfileUpdateStatus = (state) => base(state).myProfile?.updateStatus || 'idle';
export const selectMyProfileUpdateError = (state) => base(state).myProfile?.updateError || null;

// Onboarding status
export const selectOnboardingStatusData = (state) => base(state).onboarding?.data || null;
export const selectOnboardingStatusState = (state) => base(state).onboarding?.status || 'idle';
export const selectOnboardingStatusError = (state) => base(state).onboarding?.error || null;

// Onboarding applications
export const selectOnboardingApplications = (state) => base(state).onboardingApplications?.items || [];
export const selectOnboardingApplicationsStatus = (state) => base(state).onboardingApplications?.status || 'idle';
export const selectOnboardingApplicationsError = (state) => base(state).onboardingApplications?.error || null;

// Application detail
export const selectApplicationDetail = (state) => base(state).applicationDetail?.data || null;
export const selectApplicationDetailStatus = (state) => base(state).applicationDetail?.status || 'idle';
export const selectApplicationDetailError = (state) => base(state).applicationDetail?.error || null;

// Application review
export const selectApplicationReviewStatus = (state) => base(state).applicationReview?.status || 'idle';
export const selectApplicationReviewError = (state) => base(state).applicationReview?.error || null;

// Employees list
export const selectEmployees = (state) => base(state).employees?.items || [];
export const selectEmployeesPagination = (state) => base(state).employees?.pagination || null;
export const selectEmployeesStatus = (state) => base(state).employees?.status || 'idle';
export const selectEmployeesError = (state) => base(state).employees?.error || null;

// Employee detail
export const selectEmployeeDetail = (state) => base(state).employeeDetail?.data || null;
export const selectEmployeeDetailStatus = (state) => base(state).employeeDetail?.status || 'idle';
export const selectEmployeeDetailError = (state) => base(state).employeeDetail?.error || null;

// Visa status employees
export const selectVisaStatusEmployees = (state) => base(state).visaStatus?.items || [];
export const selectVisaStatusPagination = (state) => base(state).visaStatus?.pagination || null;
export const selectVisaStatusStatus = (state) => base(state).visaStatus?.status || 'idle';
export const selectVisaStatusError = (state) => base(state).visaStatus?.error || null;

// OPT in-progress employees
export const selectOptInProgressEmployees = (state) => base(state).optInProgress?.items || [];
export const selectOptInProgressPagination = (state) => base(state).optInProgress?.pagination || null;
export const selectOptInProgressStatus = (state) => base(state).optInProgress?.status || 'idle';
export const selectOptInProgressError = (state) => base(state).optInProgress?.error || null;

// Pending visa documents by employee
export const selectPendingVisaDocuments = (state, employeeId) =>
  base(state).pendingDocsByEmployee?.[employeeId]?.items || [];
export const selectPendingVisaDocumentsStatus = (state, employeeId) =>
  base(state).pendingDocsByEmployee?.[employeeId]?.status || 'idle';
export const selectPendingVisaDocumentsError = (state, employeeId) =>
  base(state).pendingDocsByEmployee?.[employeeId]?.error || null;

// Visa doc review
export const selectVisaDocReviewStatus = (state) => base(state).visaDocReview?.status || 'idle';
export const selectVisaDocReviewError = (state) => base(state).visaDocReview?.error || null;

// Reminder
export const selectReminderStatus = (state) => base(state).reminder?.status || 'idle';
export const selectReminderError = (state) => base(state).reminder?.error || null;
export const selectReminderLastMessage = (state) => base(state).reminder?.lastMessage || null;