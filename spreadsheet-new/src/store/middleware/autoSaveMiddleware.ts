import { updateDocument } from '@/services/mockApi';
import { setSaveStatus } from '../slices/uiSlice';

let saveTimeout: number | null = null;

const actionsToWatch = [
  'spreadsheet/updateCell',
  'spreadsheet/insertRow',
  'spreadsheet/deleteRow',
  'spreadsheet/insertColumn',
  'spreadsheet/deleteColumn',
  'spreadsheet/setCellsFromImport',
];

export const autoSaveMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);

  const shouldAutoSave = actionsToWatch.includes(action.type);

  if (shouldAutoSave) {
    const state = store.getState();
    const currentDocument = state.documents.currentDocument;
    const cells = state.spreadsheet.cells;
    const rows = state.spreadsheet.rows;
    const cols = state.spreadsheet.cols;

    if (currentDocument?.id) {
      if (saveTimeout) clearTimeout(saveTimeout);
      store.dispatch(setSaveStatus('saving'));

      saveTimeout = window.setTimeout(async () => {
        try {
          const cellsObject: Record<string, any> = {};
          cells.forEach((value: any, key: string) => {
            cellsObject[key] = value;
          });
          
          await updateDocument(currentDocument.id, {
            cells: cellsObject,
            rows,
            cols,
          });
          
          store.dispatch(setSaveStatus('saved'));
          setTimeout(() => store.dispatch(setSaveStatus('idle')), 1500);
        } catch {
          store.dispatch(setSaveStatus('error'));
          setTimeout(() => store.dispatch(setSaveStatus('idle')), 2000);
        }
        saveTimeout = null;
      }, 500);
    }
  }

  return result;
};