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

  const getCellValueByRef = useCallback((ref: string): CellValue => {
    const cell = cells.get(ref);
    if (!cell) return '';
    return cell.computed;
  }, [cells]);

  const evaluateAllFormulas = useCallback(() => {
    setCells(prevCells => {
      const newCells = new Map(prevCells);
      let changed = false;
      for (const [ref, cell] of newCells.entries()) {
        if (cell.type === 'formula') {
          const result = evaluateFormula(cell.raw, getCellValueByRef);
          const newComputed = result.error ? `#ERROR: ${result.error}` : (result.result ?? '');
          if (newComputed !== cell.computed) {
            newCells.set(ref, { ...cell, computed: newComputed });
            changed = true;
          }
        }
      }
      return changed ? newCells : prevCells;
    });
  }, [getCellValueByRef]);

  const updateCell = useCallback((pos: CellPosition, rawValue: string) => {
    const ref = indexToCell(pos.row, pos.col);
    const type = detectType(rawValue);
    let computed: CellValue;
    if (type === 'formula') {
      const result = evaluateFormula(rawValue, getCellValueByRef);
      computed = result.error ? `#ERROR: ${result.error}` : (result.result ?? '');
    } else {
      computed = parseValue(rawValue, type);
    }
    const newCell: CellData = { raw: rawValue, computed, type };
    setCells(prev => new Map(prev).set(ref, newCell));
    setTimeout(() => evaluateAllFormulas(), 0);
  }, [getCellValueByRef, evaluateAllFormulas]);

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

  // Вставка строки выше указанного индекса
  const insertRow = useCallback((beforeRow: number) => {
    if (beforeRow < 0 || beforeRow > rows) return;
    setRows(prev => prev + 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        let newRow = pos.row;
        if (pos.row >= beforeRow) newRow = pos.row + 1;
        else newRow = pos.row;
        const newRef = indexToCell(newRow, pos.col);
        newMap.set(newRef, cell);
      }
      return newMap;
    });
    setTimeout(() => evaluateAllFormulas(), 0);
  }, [rows, evaluateAllFormulas]);

  // Удаление строки по индексу
  const deleteRow = useCallback((rowIndex: number) => {
    if (rowIndex < 0 || rowIndex >= rows) return;
    setRows(prev => prev - 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        if (pos.row === rowIndex) continue;
        let newRow = pos.row;
        if (pos.row > rowIndex) newRow = pos.row - 1;
        else newRow = pos.row;
        const newRef = indexToCell(newRow, pos.col);
        newMap.set(newRef, cell);
      }
      return newMap;
    });
    setTimeout(() => evaluateAllFormulas(), 0);
  }, [rows, evaluateAllFormulas]);

  // Вставка столбца левее указанного индекса
  const insertColumn = useCallback((beforeCol: number) => {
    if (beforeCol < 0 || beforeCol > cols) return;
    setCols(prev => prev + 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        let newCol = pos.col;
        if (pos.col >= beforeCol) newCol = pos.col + 1;
        else newCol = pos.col;
        const newRef = indexToCell(pos.row, newCol);
        newMap.set(newRef, cell);
      }
      return newMap;
    });
    setTimeout(() => evaluateAllFormulas(), 0);
  }, [cols, evaluateAllFormulas]);

  // Удаление столбца по индексу
  const deleteColumn = useCallback((colIndex: number) => {
    if (colIndex < 0 || colIndex >= cols) return;
    setCols(prev => prev - 1);
    setCells(prev => {
      const newMap = new Map<string, CellData>();
      for (const [ref, cell] of prev.entries()) {
        const pos = cellToIndex(ref);
        if (!pos) continue;
        if (pos.col === colIndex) continue;
        let newCol = pos.col;
        if (pos.col > colIndex) newCol = pos.col - 1;
        else newCol = pos.col;
        const newRef = indexToCell(pos.row, newCol);
        newMap.set(newRef, cell);
      }
      return newMap;
    });
    setTimeout(() => evaluateAllFormulas(), 0);
  }, [cols, evaluateAllFormulas]);

  return {
    cells,
    updateCell,
    getCell,
    getCellRaw,
    getDisplayValue,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    rows,
    cols,
  };
};