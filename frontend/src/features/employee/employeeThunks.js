import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMyProfile as apiGetMyProfile,
  updateMyProfile as apiUpdateMyProfile,
  getOnboardingStatus as apiGetOnboardingStatus,
  getAllOnboardingApplications as apiGetAllOnboardingApplications,
  viewOnboardingApplication as apiViewOnboardingApplication,
  reviewOnboardingApplication as apiReviewOnboardingApplication,
  getAllEmployees as apiGetAllEmployees,
  getEmployeeById as apiGetEmployeeById,
  getAllVisaStatusEmployees as apiGetAllVisaStatusEmployees,
  getEmployeesWithIncompleteOptDocs as apiGetEmployeesWithIncompleteOptDocs,
  getPendingVisaDocuments as apiGetPendingVisaDocuments,
  reviewVisaDocument as apiReviewVisaDocument,
  sendNextStepReminder as apiSendNextStepReminder,
} from '../../api/employees.js';

export const fetchMyProfile = createAsyncThunk(
  'employee/fetchMyProfile',
  async (_, thunkAPI) => {
    const data = await apiGetMyProfile({ signal: thunkAPI.signal });
    return data.employee;
  }
);

export const updateMyProfileThunk = createAsyncThunk(
  'employee/updateMyProfile',
  async (updateData, thunkAPI) => {
    const data = await apiUpdateMyProfile(updateData, { signal: thunkAPI.signal });
    return data.employee;
  }
);

export const fetchOnboardingStatus = createAsyncThunk(
  'employee/fetchOnboardingStatus',
  async (_, thunkAPI) => {
    const data = await apiGetOnboardingStatus({ signal: thunkAPI.signal });
    const { status, hrFeedback, documents } = data;
    return { status, hrFeedback, documents };
  }
);

export const fetchOnboardingApplications = createAsyncThunk(
  'employee/fetchOnboardingApplications',
  async (params = {}, thunkAPI) => {
    const data = await apiGetAllOnboardingApplications(params, { signal: thunkAPI.signal });
    return data.applications;
  }
);

export const fetchOnboardingApplicationDetail = createAsyncThunk(
  'employee/fetchOnboardingApplicationDetail',
  async (employeeId, thunkAPI) => {
    const data = await apiViewOnboardingApplication(employeeId, { signal: thunkAPI.signal });
    return data.employee;
  }
);

export const reviewOnboardingApplicationThunk = createAsyncThunk(
  'employee/reviewOnboardingApplication',
  async ({ employeeId, status, hrFeedback }, thunkAPI) => {
    const data = await apiReviewOnboardingApplication(employeeId, { status, hrFeedback }, { signal: thunkAPI.signal });
    return data.employee;
  }
);

export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params = {}, thunkAPI) => {
    const data = await apiGetAllEmployees(params, { signal: thunkAPI.signal });
    return { employees: data.employees, pagination: data.pagination };
  }
);

export const fetchEmployeeByIdThunk = createAsyncThunk(
  'employee/fetchEmployeeById',
  async (employeeId, thunkAPI) => {
    const data = await apiGetEmployeeById(employeeId, { signal: thunkAPI.signal });
    return data.employee;
  }
);

export const fetchVisaStatusEmployees = createAsyncThunk(
  'employee/fetchVisaStatusEmployees',
  async (params = {}, thunkAPI) => {
    const data = await apiGetAllVisaStatusEmployees(params, { signal: thunkAPI.signal });
    return { employees: data.employees, pagination: data.pagination };
  }
);

export const fetchOptInProgressEmployees = createAsyncThunk(
  'employee/fetchOptInProgressEmployees',
  async (params = {}, thunkAPI) => {
    const data = await apiGetEmployeesWithIncompleteOptDocs(params, { signal: thunkAPI.signal });
    return { employees: data.employees, pagination: data.pagination };
  }
);

export const fetchPendingVisaDocuments = createAsyncThunk(
  'employee/fetchPendingVisaDocuments',
  async (employeeId, thunkAPI) => {
    const data = await apiGetPendingVisaDocuments(employeeId, { signal: thunkAPI.signal });
    return { employeeId, documents: data.documents };
  }
);

export const reviewVisaDocumentThunk = createAsyncThunk(
  'employee/reviewVisaDocument',
  async ({ docId, status, feedback }, thunkAPI) => {
    const data = await apiReviewVisaDocument(docId, { status, feedback }, { signal: thunkAPI.signal });
    return data.document;
  }
);

export const sendNextStepReminderThunk = createAsyncThunk(
  'employee/sendNextStepReminder',
  async (employeeId, thunkAPI) => {
    const data = await apiSendNextStepReminder(employeeId, { signal: thunkAPI.signal });
    return data.message;
  }
);