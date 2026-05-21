import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UiState {
  saveStatus: SaveStatus;
  isCreateModalOpen: boolean;
  isRenameModalOpen: boolean;
  isDeleteModalOpen: boolean;
  modalData: Record<string, any>;
}

const initialState: UiState = {
  saveStatus: 'idle',
  isCreateModalOpen: false,
  isRenameModalOpen: false,
  isDeleteModalOpen: false,
  modalData: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.saveStatus = action.payload;
    },
    openCreateModal: (state) => {
      state.isCreateModalOpen = true;
    },
    closeCreateModal: (state) => {
      state.isCreateModalOpen = false;
      state.modalData = {};
    },
    openRenameModal: (state, action: PayloadAction<{ documentId: string; currentName: string }>) => {
      state.isRenameModalOpen = true;
      state.modalData = action.payload;
    },
    closeRenameModal: (state) => {
      state.isRenameModalOpen = false;
      state.modalData = {};
    },
    openDeleteModal: (state, action: PayloadAction<{ documentId: string; documentName: string }>) => {
      state.isDeleteModalOpen = true;
      state.modalData = action.payload;
    },
    closeDeleteModal: (state) => {
      state.isDeleteModalOpen = false;
      state.modalData = {};
    },
  },
});

export const {
  setSaveStatus,
  openCreateModal,
  closeCreateModal,
  openRenameModal,
  closeRenameModal,
  openDeleteModal,
  closeDeleteModal,
} = uiSlice.actions;

export default uiSlice.reducer;