import { createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, getMe as getMeApi } from '../../api/auth.js';
import { getToken, clearToken } from '../../api/base.js';

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return { user: null, token: null };
      const data = await getMeApi();
      return { user: data?.employee ?? null, token };
    } catch (err) {
      clearToken();
      return rejectWithValue(err?.message || 'Failed to initialize auth');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await loginApi({ username, password });
      return { user: data?.employee ?? null, token: data?.token ?? null };
    } catch (err) {
      return rejectWithValue(err?.message || 'Login failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMeApi();
      return { user: data?.employee ?? null };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch profile');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  clearToken();
  return true;
});