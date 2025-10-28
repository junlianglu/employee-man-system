import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRegistrationTokens,
  generateRegistrationToken,
  validateRegistrationTokenThunk,
  submitRegistrationThunk,
} from './registrationTokenThunks.js';

const initialState = {
  // HR list
  tokens: [],
  tokensStatus: 'idle',
  tokensError: null,

  // HR create
  createdToken: null,
  createStatus: 'idle',
  createError: null,

  // Public validate
  validation: {
    status: 'idle',
    error: null,
    token: null,
    info: null, // { email, firstName, middleName, lastName }
  },

  // Public submit
  registration: {
    status: 'idle',
    error: null,
    employee: null, // { _id, email, username, firstName, lastName }
  },
};

const registrationTokenSlice = createSlice({
  name: 'registrationToken',
  initialState,
  reducers: {
    resetRegistrationTokenState: () => ({ ...initialState }),
    clearCreatedToken: (state) => {
      state.createdToken = null;
      state.createStatus = 'idle';
      state.createError = null;
    },
    resetValidation: (state) => {
      state.validation = { status: 'idle', error: null, token: null, info: null };
    },
    resetRegistration: (state) => {
      state.registration = { status: 'idle', error: null, employee: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tokens
      .addCase(fetchRegistrationTokens.pending, (state) => {
        state.tokensStatus = 'loading';
        state.tokensError = null;
      })
      .addCase(fetchRegistrationTokens.fulfilled, (state, action) => {
        state.tokensStatus = 'succeeded';
        state.tokens = action.payload;
      })
      .addCase(fetchRegistrationTokens.rejected, (state, action) => {
        state.tokensStatus = 'failed';
        state.tokensError = action.payload || action.error?.message || 'Failed to fetch registration tokens';
      })

      // Create token
      .addCase(generateRegistrationToken.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(generateRegistrationToken.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.createdToken = action.payload;
        if (action.payload) {
          state.tokens = Array.isArray(state.tokens) ? [action.payload, ...state.tokens] : [action.payload];
        }
      })
      .addCase(generateRegistrationToken.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload || action.error?.message || 'Failed to create registration token';
      })

      // Validate token
      .addCase(validateRegistrationTokenThunk.pending, (state) => {
        state.validation.status = 'loading';
        state.validation.error = null;
        state.validation.info = null;
      })
      .addCase(validateRegistrationTokenThunk.fulfilled, (state, action) => {
        state.validation.status = 'succeeded';
        state.validation.token = action.payload.token;
        state.validation.info = action.payload.info;
      })
      .addCase(validateRegistrationTokenThunk.rejected, (state, action) => {
        state.validation.status = 'failed';
        state.validation.error = action.payload || action.error?.message || 'Failed to validate registration token';
        state.validation.info = null;
      })

      // Submit registration
      .addCase(submitRegistrationThunk.pending, (state) => {
        state.registration.status = 'loading';
        state.registration.error = null;
        state.registration.employee = null;
      })
      .addCase(submitRegistrationThunk.fulfilled, (state, action) => {
        state.registration.status = 'succeeded';
        state.registration.employee = action.payload;
      })
      .addCase(submitRegistrationThunk.rejected, (state, action) => {
        state.registration.status = 'failed';
        state.registration.error = action.payload || action.error?.message || 'Failed to complete registration';
      });
  },
});

export const {
  resetRegistrationTokenState,
  clearCreatedToken,
  resetValidation,
  resetRegistration,
} = registrationTokenSlice.actions;

export default registrationTokenSlice.reducer;