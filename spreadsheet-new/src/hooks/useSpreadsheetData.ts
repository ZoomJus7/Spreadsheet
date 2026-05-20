import { useState, useCallback } from 'react';
import type { CellData, CellPosition, CellValue } from '@/types/spreadsheet';
import { detectType, parseValue } from '@/utils/spreadsheet/cellTypeDetector';
import { evaluateFormula } from '@/utils/formulas/evaluator';
import { indexToCell, cellToIndex } from '@/utils/formulas/cellReference';
import { DEFAULT_ROWS, DEFAULT_COLS } from '@/constants/defaultConfig';

export const useSpreadsheetData = (initialRows: number = DEFAULT_ROWS, initialCols: number = DEFAULT_COLS) => {
  const [cells, setCells] = useState<Map<string, CellData>>(new Map());
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);

  const getCellValueByRef = useCallback((cellsMap: Map<string, CellData>, ref: string): CellValue => {
    const cell = cellsMap.get(ref);
    return cell ? cell.computed : '';
  }, []);

  const recomputeFormulas = useCallback((cellsMap: Map<string, CellData>): Map<string, CellData> => {
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
  }, [getCellValueByRef]);

  const updateCell = useCallback((pos: CellPosition, rawValue: string) => {
    if (pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols) return;
    const ref = indexToCell(pos.row, pos.col);
    const type = detectType(rawValue);
    let computed: CellValue;
    if (type === 'formula') {
      computed = rawValue;
    } else {
      computed = parseValue(rawValue, type);
    }
    const newCell: CellData = { raw: rawValue, computed, type };
    setCells(prev => {
      const updated = new Map(prev);
      updated.set(ref, newCell);
      return recomputeFormulas(updated);
    });
  }, [rows, cols, recomputeFormulas]);

  const getCell = useCallback((pos: CellPosition): CellData | undefined => {
    if (pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols) return undefined;
    const ref = indexToCell(pos.row, pos.col);
    return cells.get(ref);
  }, [cells, rows, cols]);

  const getCellRaw = useCallback((pos: CellPosition): string => getCell(pos)?.raw ?? '', [getCell]);
  
  const getDisplayValue = useCallback((pos: CellPosition): string => {
    const cell = getCell(pos);
    return cell ? String(cell.computed) : '';
  }, [getCell]);

  // Новая функция для загрузки данных документа
  const loadDocumentData = useCallback((newCells: Record<string, CellData>, newRows: number, newCols: number) => {
    const cellsMap = new Map<string, CellData>();
    for (const [key, value] of Object.entries(newCells)) {
      cellsMap.set(key, value);
    }
    const finalMap = recomputeFormulas(cellsMap);
    setCells(finalMap);
    setRows(newRows);
    setCols(newCols);
  }, [recomputeFormulas]);

  const insertRow = useCallback((beforeRow: number) => {
    if (beforeRow < 0 || beforeRow > rows) return;
    setRows(prev => prev + 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        let newRow = pos.row >= beforeRow ? pos.row + 1 : pos.row;
        const newRef = indexToCell(newRow, pos.col);
        newMap.set(newRef, cell);
      }
      return recomputeFormulas(newMap);
    });
  }, [rows, recomputeFormulas]);

  const deleteRow = useCallback((rowIndex: number) => {
    if (rowIndex < 0 || rowIndex >= rows) return;
    setRows(prev => prev - 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        if (pos.row === rowIndex) continue;
        let newRow = pos.row > rowIndex ? pos.row - 1 : pos.row;
        const newRef = indexToCell(newRow, pos.col);
        newMap.set(newRef, cell);
      }
      return recomputeFormulas(newMap);
    });
  }, [rows, recomputeFormulas]);

  const insertColumn = useCallback((beforeCol: number) => {
    if (beforeCol < 0 || beforeCol > cols) return;
    setCols(prev => prev + 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        let newCol = pos.col >= beforeCol ? pos.col + 1 : pos.col;
        const newRef = indexToCell(pos.row, newCol);
        newMap.set(newRef, cell);
      }
      return recomputeFormulas(newMap);
    });
  }, [cols, recomputeFormulas]);

  const deleteColumn = useCallback((colIndex: number) => {
    if (colIndex < 0 || colIndex >= cols) return;
    setCols(prev => prev - 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        if (pos.col === colIndex) continue;
        let newCol = pos.col > colIndex ? pos.col - 1 : pos.col;
        const newRef = indexToCell(pos.row, newCol);
        newMap.set(newRef, cell);
      }
      return recomputeFormulas(newMap);
    });
  }, [cols, recomputeFormulas]);

  return {
    cells,
    rows,
    cols,
    updateCell,
    getCell,
    getCellRaw,
    getDisplayValue,
    loadDocumentData,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
  };
};