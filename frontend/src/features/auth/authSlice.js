import { createSlice } from '@reduxjs/toolkit';
import { initializeAuth, login, fetchMe, logout } from './authThunks.js';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHR: false,
  initStatus: 'idle',
  loginStatus: 'idle',
  profileStatus: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      // initialize
      .addCase(initializeAuth.pending, (state) => {
        state.initStatus = 'loading';
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.initStatus = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.user && !!action.payload.token;
        state.isHR = !!action.payload.user?.isHR;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.initStatus = 'failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isHR = false;
        state.error = action.payload || action.error?.message || 'Initialization failed';
      })
      // login
      .addCase(login.pending, (state) => {
        state.loginStatus = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.user && !!action.payload.token;
        state.isHR = !!action.payload.user?.isHR;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.error = action.payload || action.error?.message || 'Login failed';
      })
      // fetchMe
      .addCase(fetchMe.pending, (state) => {
        state.profileStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.user = action.payload.user;
        state.isHR = !!action.payload.user?.isHR;
        state.isAuthenticated = !!state.user && !!state.token;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to fetch profile';
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isHR = false;
        state.loginStatus = 'idle';
        state.profileStatus = 'idle';
        state.error = null;
      });
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;