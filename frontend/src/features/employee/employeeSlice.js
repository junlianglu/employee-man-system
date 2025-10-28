import { createSlice } from '@reduxjs/toolkit';
import {
  fetchMyProfile,
  updateMyProfileThunk,
  fetchOnboardingStatus,
  fetchOnboardingApplications,
  fetchOnboardingApplicationDetail,
  reviewOnboardingApplicationThunk,
  fetchEmployees,
  fetchEmployeeByIdThunk,
  fetchVisaStatusEmployees,
  fetchOptInProgressEmployees,
  fetchPendingVisaDocuments,
  reviewVisaDocumentThunk,
  sendNextStepReminderThunk,
} from './employeeThunks.js';

const initialState = {
  myProfile: {
    data: null,
    status: 'idle',
    error: null,
    updateStatus: 'idle',
    updateError: null,
  },
  onboarding: {
    data: null, // { status, hrFeedback, documents }
    status: 'idle',
    error: null,
  },
  onboardingApplications: {
    items: [],
    status: 'idle',
    error: null,
  },
  applicationDetail: {
    data: null,
    status: 'idle',
    error: null,
  },
  applicationReview: {
    status: 'idle',
    error: null,
  },
  employees: {
    items: [],
    pagination: null,
    status: 'idle',
    error: null,
  },
  employeeDetail: {
    data: null,
    status: 'idle',
    error: null,
  },
  visaStatus: {
    items: [],
    pagination: null,
    status: 'idle',
    error: null,
  },
  optInProgress: {
    items: [],
    pagination: null,
    status: 'idle',
    error: null,
  },
  pendingDocsByEmployee: {
    // [employeeId]: { items, status, error }
  },
  visaDocReview: {
    status: 'idle',
    error: null,
  },
  reminder: {
    status: 'idle',
    error: null,
    lastMessage: null,
  },
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearEmployeeDetail(state) {
      state.employeeDetail = { data: null, status: 'idle', error: null };
    },
    clearApplicationDetail(state) {
      state.applicationDetail = { data: null, status: 'idle', error: null };
    },
  },
  extraReducers: (builder) => {
    // My profile
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.myProfile.status = 'loading';
        state.myProfile.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.myProfile.status = 'succeeded';
        state.myProfile.data = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.myProfile.status = 'failed';
        state.myProfile.error = action.error?.message || 'Failed to load profile';
      });

    builder
      .addCase(updateMyProfileThunk.pending, (state) => {
        state.myProfile.updateStatus = 'loading';
        state.myProfile.updateError = null;
      })
      .addCase(updateMyProfileThunk.fulfilled, (state, action) => {
        state.myProfile.updateStatus = 'succeeded';
        state.myProfile.data = action.payload;
      })
      .addCase(updateMyProfileThunk.rejected, (state, action) => {
        state.myProfile.updateStatus = 'failed';
        state.myProfile.updateError = action.error?.message || 'Failed to update profile';
      });

    // Onboarding status
    builder
      .addCase(fetchOnboardingStatus.pending, (state) => {
        state.onboarding.status = 'loading';
        state.onboarding.error = null;
      })
      .addCase(fetchOnboardingStatus.fulfilled, (state, action) => {
        state.onboarding.status = 'succeeded';
        state.onboarding.data = action.payload;
      })
      .addCase(fetchOnboardingStatus.rejected, (state, action) => {
        state.onboarding.status = 'failed';
        state.onboarding.error = action.error?.message || 'Failed to load onboarding status';
      });

    // Onboarding applications
    builder
      .addCase(fetchOnboardingApplications.pending, (state) => {
        state.onboardingApplications.status = 'loading';
        state.onboardingApplications.error = null;
      })
      .addCase(fetchOnboardingApplications.fulfilled, (state, action) => {
        state.onboardingApplications.status = 'succeeded';
        state.onboardingApplications.items = action.payload || [];
      })
      .addCase(fetchOnboardingApplications.rejected, (state, action) => {
        state.onboardingApplications.status = 'failed';
        state.onboardingApplications.error = action.error?.message || 'Failed to load applications';
      });

    // Application detail
    builder
      .addCase(fetchOnboardingApplicationDetail.pending, (state) => {
        state.applicationDetail.status = 'loading';
        state.applicationDetail.error = null;
      })
      .addCase(fetchOnboardingApplicationDetail.fulfilled, (state, action) => {
        state.applicationDetail.status = 'succeeded';
        state.applicationDetail.data = action.payload;
      })
      .addCase(fetchOnboardingApplicationDetail.rejected, (state, action) => {
        state.applicationDetail.status = 'failed';
        state.applicationDetail.error = action.error?.message || 'Failed to load application';
      });

    // Application review
    builder
      .addCase(reviewOnboardingApplicationThunk.pending, (state) => {
        state.applicationReview.status = 'loading';
        state.applicationReview.error = null;
      })
      .addCase(reviewOnboardingApplicationThunk.fulfilled, (state, action) => {
        state.applicationReview.status = 'succeeded';
        if (state.applicationDetail.data && state.applicationDetail.data._id === action.payload._id) {
          state.applicationDetail.data = action.payload;
        }
        const idx = state.onboardingApplications.items.findIndex(e => e._id === action.payload._id);
        if (idx >= 0) state.onboardingApplications.items[idx] = action.payload;
      })
      .addCase(reviewOnboardingApplicationThunk.rejected, (state, action) => {
        state.applicationReview.status = 'failed';
        state.applicationReview.error = action.error?.message || 'Failed to review application';
      });

    // Employees list
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.employees.status = 'loading';
        state.employees.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees.status = 'succeeded';
        state.employees.items = action.payload.employees || [];
        state.employees.pagination = action.payload.pagination || null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.employees.status = 'failed';
        state.employees.error = action.error?.message || 'Failed to load employees';
      });

    // Employee detail
    builder
      .addCase(fetchEmployeeByIdThunk.pending, (state) => {
        state.employeeDetail.status = 'loading';
        state.employeeDetail.error = null;
      })
      .addCase(fetchEmployeeByIdThunk.fulfilled, (state, action) => {
        state.employeeDetail.status = 'succeeded';
        state.employeeDetail.data = action.payload;
      })
      .addCase(fetchEmployeeByIdThunk.rejected, (state, action) => {
        state.employeeDetail.status = 'failed';
        state.employeeDetail.error = action.error?.message || 'Failed to load employee';
      });

    // Visa status lists
    builder
      .addCase(fetchVisaStatusEmployees.pending, (state) => {
        state.visaStatus.status = 'loading';
        state.visaStatus.error = null;
      })
      .addCase(fetchVisaStatusEmployees.fulfilled, (state, action) => {
        state.visaStatus.status = 'succeeded';
        state.visaStatus.items = action.payload.employees || [];
        state.visaStatus.pagination = action.payload.pagination || null;
      })
      .addCase(fetchVisaStatusEmployees.rejected, (state, action) => {
        state.visaStatus.status = 'failed';
        state.visaStatus.error = action.error?.message || 'Failed to load visa status employees';
      });

    builder
      .addCase(fetchOptInProgressEmployees.pending, (state) => {
        state.optInProgress.status = 'loading';
        state.optInProgress.error = null;
      })
      .addCase(fetchOptInProgressEmployees.fulfilled, (state, action) => {
        state.optInProgress.status = 'succeeded';
        state.optInProgress.items = action.payload.employees || [];
        state.optInProgress.pagination = action.payload.pagination || null;
      })
      .addCase(fetchOptInProgressEmployees.rejected, (state, action) => {
        state.optInProgress.status = 'failed';
        state.optInProgress.error = action.error?.message || 'Failed to load in-progress OPT employees';
      });

    // Pending visa documents per employee
    builder
      .addCase(fetchPendingVisaDocuments.pending, (state, action) => {
        const employeeId = action.meta.arg;
        state.pendingDocsByEmployee[employeeId] = state.pendingDocsByEmployee[employeeId] || { items: [], status: 'idle', error: null };
        state.pendingDocsByEmployee[employeeId].status = 'loading';
        state.pendingDocsByEmployee[employeeId].error = null;
      })
      .addCase(fetchPendingVisaDocuments.fulfilled, (state, action) => {
        const { employeeId, documents } = action.payload;
        state.pendingDocsByEmployee[employeeId] = state.pendingDocsByEmployee[employeeId] || { items: [], status: 'idle', error: null };
        state.pendingDocsByEmployee[employeeId].status = 'succeeded';
        state.pendingDocsByEmployee[employeeId].items = documents || [];
      })
      .addCase(fetchPendingVisaDocuments.rejected, (state, action) => {
        const employeeId = action.meta.arg;
        state.pendingDocsByEmployee[employeeId] = state.pendingDocsByEmployee[employeeId] || { items: [], status: 'idle', error: null };
        state.pendingDocsByEmployee[employeeId].status = 'failed';
        state.pendingDocsByEmployee[employeeId].error = action.error?.message || 'Failed to load pending documents';
      });

    // Review visa document
    builder
      .addCase(reviewVisaDocumentThunk.pending, (state) => {
        state.visaDocReview.status = 'loading';
        state.visaDocReview.error = null;
      })
      .addCase(reviewVisaDocumentThunk.fulfilled, (state) => {
        state.visaDocReview.status = 'succeeded';
      })
      .addCase(reviewVisaDocumentThunk.rejected, (state, action) => {
        state.visaDocReview.status = 'failed';
        state.visaDocReview.error = action.error?.message || 'Failed to review visa document';
      });

    // Send reminder
    builder
      .addCase(sendNextStepReminderThunk.pending, (state) => {
        state.reminder.status = 'loading';
        state.reminder.error = null;
        state.reminder.lastMessage = null;
      })
      .addCase(sendNextStepReminderThunk.fulfilled, (state, action) => {
        state.reminder.status = 'succeeded';
        state.reminder.lastMessage = action.payload || 'Reminder sent';
      })
      .addCase(sendNextStepReminderThunk.rejected, (state, action) => {
        state.reminder.status = 'failed';
        state.reminder.error = action.error?.message || 'Failed to send reminder';
      });
  },
});

export const { clearEmployeeDetail, clearApplicationDetail } = employeeSlice.actions;
export default employeeSlice.reducer;