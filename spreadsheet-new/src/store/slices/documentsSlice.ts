import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, duplicateDocument } from '@/services/mockApi';
import type { DocumentMeta, Document } from '@/types/document';

interface DocumentsState {
  list: DocumentMeta[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  list: [],
  currentDocument: null,
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async () => {
  return await getDocuments();
});

export const fetchDocumentById = createAsyncThunk('documents/fetchDocumentById', async (id: string) => {
  return await getDocumentById(id);
});

export const createNewDocument = createAsyncThunk(
  'documents/createNewDocument',
  async ({ name, rows, cols }: { name: string; rows: number; cols: number }) => {
    return await createDocument(name, rows, cols);
  }
);

export const renameDocument = createAsyncThunk(
  'documents/renameDocument',
  async ({ id, newName }: { id: string; newName: string }) => {
    await updateDocument(id, { name: newName });
    return { id, newName };
  }
);

export const deleteDocumentThunk = createAsyncThunk('documents/deleteDocument', async (id: string) => {
  await deleteDocument(id);
  return id;
});

export const duplicateDocumentThunk = createAsyncThunk('documents/duplicateDocument', async (id: string) => {
  return await duplicateDocument(id);
});

export const saveDocument = createAsyncThunk(
  'documents/saveDocument',
  async ({ id, cells, rows, cols }: { id: string; cells: Record<string, any>; rows: number; cols: number }) => {
    await updateDocument(id, { cells, rows, cols });
    return { id, cells, rows, cols };
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state) => {
        state.loading = false;
        state.error = 'Ошибка загрузки документов';
      })
      // fetchDocumentById
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
      })
      // createNewDocument
      .addCase(createNewDocument.fulfilled, (state, action) => {
        state.list.push({
          id: action.payload.id,
          name: action.payload.name,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
          rows: action.payload.rows,
          cols: action.payload.cols,
        });
        state.currentDocument = action.payload;
      })
      // renameDocument
      .addCase(renameDocument.fulfilled, (state, action) => {
        const { id, newName } = action.payload;
        const doc = state.list.find(d => d.id === id);
        if (doc) doc.name = newName;
        if (state.currentDocument?.id === id) state.currentDocument.name = newName;
      })
      // deleteDocumentThunk
      .addCase(deleteDocumentThunk.fulfilled, (state, action) => {
        state.list = state.list.filter(d => d.id !== action.payload);
        if (state.currentDocument?.id === action.payload) state.currentDocument = null;
      })
      // duplicateDocumentThunk
      .addCase(duplicateDocumentThunk.fulfilled, (state, action) => {
        state.list.push({
          id: action.payload.id,
          name: action.payload.name,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
          rows: action.payload.rows,
          cols: action.payload.cols,
        });
      });
  },
});

export const { clearCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;