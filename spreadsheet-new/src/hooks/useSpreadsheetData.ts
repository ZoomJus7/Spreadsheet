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

  // Функция для получения значения ячейки по ссылке (использует текущее состояние)
  // Она будет вызываться внутри updateCell с актуальным состоянием
  const getCellValueByRef = useCallback((cellsMap: Map<string, CellData>, ref: string): CellValue => {
    const cell = cellsMap.get(ref);
    if (!cell) return '';
    return cell.computed;
  }, []);

  // Пересчёт всех формул в карте ячеек
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
    // Сначала создаём временную карту с обновлённой ячейкой
    let newCell: CellData;
    if (type === 'formula') {
      // Для формулы вычислить сразу, но зависимости могут быть не готовы – сначала запишем raw, потом пересчитаем
      newCell = { raw: rawValue, computed: rawValue, type };
    } else {
      computed = parseValue(rawValue, type);
      newCell = { raw: rawValue, computed, type };
    }
    setCells(prev => {
      const updatedMap = new Map(prev);
      updatedMap.set(ref, newCell);
      // Если это формула, нужно пересчитать все формулы после её добавления
      if (type === 'formula') {
        return recomputeFormulas(updatedMap);
      } else {
        // Для не-формул тоже пересчитать все формулы (так как они могли зависеть от изменённой ячейки)
        return recomputeFormulas(updatedMap);
      }
    });
  }, [rows, cols, recomputeFormulas]);

  // Остальные функции (insertRow, deleteRow и т.д.) должны также использовать recomputeFormulas
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

  // Вставка строки
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
      // После сдвига строк пересчитать формулы
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
        let newRow = pos.row;
        if (pos.row > rowIndex) newRow = pos.row - 1;
        else newRow = pos.row;
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
        let newCol = pos.col;
        if (pos.col >= beforeCol) newCol = pos.col + 1;
        else newCol = pos.col;
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
        let newCol = pos.col;
        if (pos.col > colIndex) newCol = pos.col - 1;
        else newCol = pos.col;
        const newRef = indexToCell(pos.row, newCol);
        newMap.set(newRef, cell);
      }
      return recomputeFormulas(newMap);
    });
  }, [cols, recomputeFormulas]);

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