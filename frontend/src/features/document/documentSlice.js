import { createSlice } from '@reduxjs/toolkit';
import {
  fetchMyDocuments,
  fetchEmployeeDocuments,
  uploadMyDocument,
  reviewDocumentThunk,
  viewDocumentUrl,
  downloadDocumentThunk,
} from './documentThunks.js';

const initialState = {
  my: {
    items: [],
    status: 'idle',
    error: null,
    uploadStatus: 'idle',
    uploadError: null,
  },
  byEmployee: {
    // [employeeId]: { items, status, error }
  },
  review: {
    status: 'idle',
    error: null,
  },
  preview: {
    url: null,
    filename: null,
    contentType: null,
    status: 'idle',
    error: null,
  },
  download: {
    status: 'idle',
    error: null,
  },
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearPreview(state) {
      state.preview.url = null;
      state.preview.filename = null;
      state.preview.contentType = null;
      state.preview.status = 'idle';
      state.preview.error = null;
    },
    resetMyDocuments(state) {
      state.my = { items: [], status: 'idle', error: null, uploadStatus: 'idle', uploadError: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDocuments.pending, (state) => {
        state.my.status = 'loading';
        state.my.error = null;
      })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.my.status = 'succeeded';
        state.my.items = action.payload || [];
      })
      .addCase(fetchMyDocuments.rejected, (state, action) => {
        state.my.status = 'failed';
        state.my.error = action.error?.message || 'Failed to load documents';
      });

    builder
      .addCase(fetchEmployeeDocuments.pending, (state, action) => {
        const employeeId = action.meta.arg;
        state.byEmployee[employeeId] = state.byEmployee[employeeId] || { items: [], status: 'idle', error: null };
        state.byEmployee[employeeId].status = 'loading';
        state.byEmployee[employeeId].error = null;
      })
      .addCase(fetchEmployeeDocuments.fulfilled, (state, action) => {
        const { employeeId, documents } = action.payload;
        state.byEmployee[employeeId] = state.byEmployee[employeeId] || { items: [], status: 'idle', error: null };
        state.byEmployee[employeeId].status = 'succeeded';
        state.byEmployee[employeeId].items = documents || [];
      })
      .addCase(fetchEmployeeDocuments.rejected, (state, action) => {
        const employeeId = action.meta.arg;
        state.byEmployee[employeeId] = state.byEmployee[employeeId] || { items: [], status: 'idle', error: null };
        state.byEmployee[employeeId].status = 'failed';
        state.byEmployee[employeeId].error = action.error?.message || 'Failed to load documents';
      });

    builder
      .addCase(uploadMyDocument.pending, (state) => {
        state.my.uploadStatus = 'loading';
        state.my.uploadError = null;
      })
      .addCase(uploadMyDocument.fulfilled, (state, action) => {
        state.my.uploadStatus = 'succeeded';
        const updated = action.payload;
        const idx = state.my.items.findIndex((d) => d._id === updated._id || d.type === updated.type);
        if (idx >= 0) state.my.items[idx] = updated;
        else state.my.items.push(updated);
      })
      .addCase(uploadMyDocument.rejected, (state, action) => {
        state.my.uploadStatus = 'failed';
        state.my.uploadError = action.error?.message || 'Failed to upload document';
      });

    builder
      .addCase(reviewDocumentThunk.pending, (state) => {
        state.review.status = 'loading';
        state.review.error = null;
      })
      .addCase(reviewDocumentThunk.fulfilled, (state, action) => {
        state.review.status = 'succeeded';
        const updated = action.payload;

        const i1 = state.my.items.findIndex((d) => d._id === updated._id);
        if (i1 >= 0) state.my.items[i1] = updated;

        Object.values(state.byEmployee).forEach((bucket) => {
          const i = bucket.items.findIndex((d) => d._id === updated._id);
          if (i >= 0) bucket.items[i] = updated;
        });
      })
      .addCase(reviewDocumentThunk.rejected, (state, action) => {
        state.review.status = 'failed';
        state.review.error = action.error?.message || 'Failed to review document';
      });

    builder
      .addCase(viewDocumentUrl.pending, (state) => {
        state.preview.status = 'loading';
        state.preview.error = null;
      })
      .addCase(viewDocumentUrl.fulfilled, (state, action) => {
        const { url, filename, contentType } = action.payload;
        state.preview.status = 'succeeded';
        state.preview.url = url;
        state.preview.filename = filename;
        state.preview.contentType = contentType;
      })
      .addCase(viewDocumentUrl.rejected, (state, action) => {
        state.preview.status = 'failed';
        state.preview.error = action.error?.message || 'Failed to load preview';
        state.preview.url = null;
        state.preview.filename = null;
        state.preview.contentType = null;
      });

    builder
      .addCase(downloadDocumentThunk.pending, (state) => {
        state.download.status = 'loading';
        state.download.error = null;
      })
      .addCase(downloadDocumentThunk.fulfilled, (state) => {
        state.download.status = 'succeeded';
      })
      .addCase(downloadDocumentThunk.rejected, (state, action) => {
        state.download.status = 'failed';
        state.download.error = action.error?.message || 'Failed to download document';
      });
  },
});

export const { clearPreview, resetMyDocuments } = documentSlice.actions;
export default documentSlice.reducer;