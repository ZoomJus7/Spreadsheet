let saveTimeout: number | null = null;

export const autoSaveMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);

  if (action.type === 'spreadsheet/updateCell') {
    const state = store.getState();
    const currentDocument = state.documents.currentDocument;
    const cells = state.spreadsheet.cells;
    const rows = state.spreadsheet.rows;
    const cols = state.spreadsheet.cols;

    if (currentDocument?.id) {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => {
        console.log('Автосохранение:', currentDocument.id);
        saveTimeout = null;
      }, 500);
    }
  }

  return result;
};