import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CellData, CellPosition, SelectionRange } from '@/types/spreadsheet';
import { indexToCell, cellToIndex } from '@/utils/formulas/cellReference';
import { detectType, parseValue } from '@/utils/spreadsheet/cellTypeDetector';
import { evaluateFormula } from '@/utils/formulas/evaluator';

interface SpreadsheetState {
  cells: Map<string, CellData>;
  rows: number;
  cols: number;
  selectedCell: CellPosition | null;
  selectedRange: SelectionRange | null;
  anchorCell: CellPosition | null;
  history: Map<string, CellData>[];
  historyIndex: number;
}

const initialState: SpreadsheetState = {
  cells: new Map(),
  rows: 100,
  cols: 26,
  selectedCell: null,
  selectedRange: null,
  anchorCell: null,
  history: [],
  historyIndex: -1,
};

const getCellValueByRef = (cellsMap: Map<string, CellData>, ref: string): string | number | boolean => {
  const cell = cellsMap.get(ref);
  return cell ? cell.computed : '';
};

const recomputeFormulas = (cellsMap: Map<string, CellData>): Map<string, CellData> => {
  const newCells = new Map(cellsMap);
  let changed = false;
  for (const [ref, cell] of newCells.entries()) {
    if (cell.type === 'formula') {
      const result = evaluateFormula(cell.raw, (r) => getCellValueByRef(newCells, r));
      const newComputed = result.error ? `#ERROR: ${result.error}` : (result.result ?? '');
      if (newComputed !== cell.computed) {
        newCells.set(ref, { ...cell, computed: newComputed });
        changed = true;
      }
    }
  }
  return changed ? newCells : cellsMap;
};

const saveToHistory = (state: SpreadsheetState) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(new Map(state.cells));
  state.history = newHistory;
  state.historyIndex = newHistory.length - 1;
  if (state.history.length > 50) {
    state.history.shift();
    state.historyIndex--;
  }
};

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    loadDocumentData: (state, action: PayloadAction<{ cells: Record<string, CellData>; rows: number; cols: number }>) => {
      const { cells, rows, cols } = action.payload;
      const cellsMap = new Map<string, CellData>();
      for (const [key, value] of Object.entries(cells)) {
        cellsMap.set(key, value);
      }
      state.cells = recomputeFormulas(cellsMap);
      state.rows = rows;
      state.cols = cols;
      state.selectedCell = null;
      state.selectedRange = null;
      state.anchorCell = null;
      state.history = [];
      state.historyIndex = -1;
      saveToHistory(state);
    },

    updateCell: (state, action: PayloadAction<{ pos: CellPosition; rawValue: string }>) => {
      const { pos, rawValue } = action.payload;
      if (pos.row < 0 || pos.row >= state.rows || pos.col < 0 || pos.col >= state.cols) return;
      const ref = indexToCell(pos.row, pos.col);
      const type = detectType(rawValue);
      let computed: string | number | boolean;
      if (type === 'formula') {
        computed = rawValue;
      } else {
        computed = parseValue(rawValue, type);
      }
      const newCell: CellData = { raw: rawValue, computed, type };
      const newCells = new Map(state.cells);
      newCells.set(ref, newCell);
      state.cells = recomputeFormulas(newCells);
      saveToHistory(state);
    },

    setCellsFromImport: (state, action: PayloadAction<{ cells: Map<string, CellData>; rows: number; cols: number }>) => {
      const { cells, rows, cols } = action.payload;
      state.cells = recomputeFormulas(cells);
      state.rows = rows;
      state.cols = cols;
      state.selectedCell = null;
      state.selectedRange = null;
      saveToHistory(state);
    },

    selectCell: (state, action: PayloadAction<{ pos: CellPosition; withShift: boolean }>) => {
      const { pos, withShift } = action.payload;
      if (!withShift || !state.anchorCell) {
        state.selectedCell = pos;
        state.anchorCell = pos;
        state.selectedRange = null;
      } else {
        const startRow = Math.min(state.anchorCell.row, pos.row);
        const endRow = Math.max(state.anchorCell.row, pos.row);
        const startCol = Math.min(state.anchorCell.col, pos.col);
        const endCol = Math.max(state.anchorCell.col, pos.col);
        state.selectedRange = {
          start: { row: startRow, col: startCol },
          end: { row: endRow, col: endCol },
        };
        state.selectedCell = pos;
      }
    },

    clearSelection: (state) => {
      state.selectedCell = null;
      state.selectedRange = null;
      state.anchorCell = null;
    },

    insertRow: (state, action: PayloadAction<number>) => {
      const beforeRow = action.payload;
      if (beforeRow < 0 || beforeRow > state.rows) return;
      state.rows += 1;
      const newCells = new Map<string, CellData>();
      for (const [ref, cell] of state.cells.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        let newRow = pos.row >= beforeRow ? pos.row + 1 : pos.row;
        const newRef = indexToCell(newRow, pos.col);
        newCells.set(newRef, cell);
      }
      state.cells = recomputeFormulas(newCells);
      saveToHistory(state);
    },

    deleteRow: (state, action: PayloadAction<number>) => {
      const rowIndex = action.payload;
      if (rowIndex < 0 || rowIndex >= state.rows) return;
      state.rows -= 1;
      const newCells = new Map<string, CellData>();
      for (const [ref, cell] of state.cells.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        if (pos.row === rowIndex) continue;
        let newRow = pos.row > rowIndex ? pos.row - 1 : pos.row;
        const newRef = indexToCell(newRow, pos.col);
        newCells.set(newRef, cell);
      }
      state.cells = recomputeFormulas(newCells);
      saveToHistory(state);
    },

    insertColumn: (state, action: PayloadAction<number>) => {
      const beforeCol = action.payload;
      if (beforeCol < 0 || beforeCol > state.cols) return;
      state.cols += 1;
      const newCells = new Map<string, CellData>();
      for (const [ref, cell] of state.cells.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        let newCol = pos.col >= beforeCol ? pos.col + 1 : pos.col;
        const newRef = indexToCell(pos.row, newCol);
        newCells.set(newRef, cell);
      }
      state.cells = recomputeFormulas(newCells);
      saveToHistory(state);
    },

    deleteColumn: (state, action: PayloadAction<number>) => {
      const colIndex = action.payload;
      if (colIndex < 0 || colIndex >= state.cols) return;
      state.cols -= 1;
      const newCells = new Map<string, CellData>();
      for (const [ref, cell] of state.cells.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        if (pos.col === colIndex) continue;
        let newCol = pos.col > colIndex ? pos.col - 1 : pos.col;
        const newRef = indexToCell(pos.row, newCol);
        newCells.set(newRef, cell);
      }
      state.cells = recomputeFormulas(newCells);
      saveToHistory(state);
    },

    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.cells = new Map(state.history[state.historyIndex]);
      }
    },

    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.cells = new Map(state.history[state.historyIndex]);
      }
    },
  },
});

export const {
  loadDocumentData,
  updateCell,
  setCellsFromImport,
  selectCell,
  clearSelection,
  insertRow,
  deleteRow,
  insertColumn,
  deleteColumn,
  undo,
  redo,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;