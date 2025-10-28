import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMyDocuments,
  getEmployeeDocuments,
  uploadDocument,
  reviewDocument,
  viewDocument,
  hrViewDocument,
  downloadDocument,
  hrDownloadDocument,
} from '../../api/documents.js';

export const fetchMyDocuments = createAsyncThunk(
  'documents/fetchMyDocuments',
  async (_, thunkAPI) => {
    const data = await getMyDocuments({ signal: thunkAPI.signal });
    return data.documents;
  }
);

export const fetchEmployeeDocuments = createAsyncThunk(
  'documents/fetchEmployeeDocuments',
  async (employeeId, thunkAPI) => {
    const data = await getEmployeeDocuments(employeeId, { signal: thunkAPI.signal });
    return { employeeId, documents: data.documents };
  }
);

export const uploadMyDocument = createAsyncThunk(
  'documents/uploadMyDocument',
  async ({ type, file }, thunkAPI) => {
    const data = await uploadDocument({ type, file }, { signal: thunkAPI.signal });
    return data.document;
  }
);

export const reviewDocumentThunk = createAsyncThunk(
  'documents/reviewDocument',
  async ({ docId, status, hrFeedback }, thunkAPI) => {
    const data = await reviewDocument(docId, { status, hrFeedback }, { signal: thunkAPI.signal });
    return data.document;
  }
);

export const viewDocumentUrl = createAsyncThunk(
  'documents/viewDocumentUrl',
  async ({ docId, hr = false }, thunkAPI) => {
    const fn = hr ? hrViewDocument : viewDocument;
    const { blob, contentType, filename } = await fn(docId, { signal: thunkAPI.signal });
    const url = URL.createObjectURL(blob);
    return { docId, url, contentType, filename };
  }
);

export const downloadDocumentThunk = createAsyncThunk(
  'documents/downloadDocument',
  async ({ docId, hr = false }, thunkAPI) => {
    const fn = hr ? hrDownloadDocument : downloadDocument;
    const { blob, filename, contentType } = await fn(docId, { signal: thunkAPI.signal });
    return { blob, filename, contentType };
  }
);