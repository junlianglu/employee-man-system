import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import documentsReducer from '../features/document/documentSlice.js';
import registrationTokenReducer from '../features/registrationToken/registrationTokenSlice.js';
import employeeReducer from '../features/employee/employeeSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    registrationToken: registrationTokenReducer,
    employee: employeeReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV !== false,
});