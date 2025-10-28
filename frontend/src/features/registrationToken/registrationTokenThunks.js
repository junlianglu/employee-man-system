import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllRegistrationTokens,
  createRegistrationToken,
  validateRegistrationToken,
  submitRegistration,
} from '../../api/registrationTokens.js';

export const fetchRegistrationTokens = createAsyncThunk(
  'registrationToken/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllRegistrationTokens();
      return data?.tokens ?? [];
    } catch (err) {
      return rejectWithValue(err?.data?.error || err?.message || 'Failed to fetch registration tokens');
    }
  }
);

export const generateRegistrationToken = createAsyncThunk(
  'registrationToken/create',
  async ({ email, firstName, lastName, middleName }, { rejectWithValue }) => {
    try {
      const data = await createRegistrationToken({ email, firstName, lastName, middleName });
      return data?.token ?? null;
    } catch (err) {
      return rejectWithValue(err?.data?.error || err?.message || 'Failed to create registration token');
    }
  }
);

export const validateRegistrationTokenThunk = createAsyncThunk(
  'registrationToken/validate',
  async ({ token }, { rejectWithValue }) => {
    try {
      const data = await validateRegistrationToken(token);
      return {
        token,
        info: {
          email: data?.email ?? null,
          firstName: data?.firstName ?? null,
          middleName: data?.middleName ?? '',
          lastName: data?.lastName ?? null,
        },
      };
    } catch (err) {
      return rejectWithValue(err?.data?.error || err?.message || 'Failed to validate registration token');
    }
  }
);

export const submitRegistrationThunk = createAsyncThunk(
  'registrationToken/submit',
  async ({ token, employeeData }, { rejectWithValue }) => {
    try {
      const data = await submitRegistration(token, employeeData);
      return data?.employee ?? null;
    } catch (err) {
      return rejectWithValue(err?.data?.error || err?.message || 'Failed to complete registration');
    }
  }
);