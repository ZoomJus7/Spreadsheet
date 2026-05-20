import { useState, useCallback } from 'react';
import type { CellData, CellPosition, CellValue } from '@/types/spreadsheet';
import { detectType, parseValue } from '@/utils/spreadsheet/cellTypeDetector';
import { indexToCell } from '@/utils/formulas/cellReference';
import { DEFAULT_ROWS, DEFAULT_COLS } from '@/constants/defaultConfig';

export const useSpreadsheetData = (rows: number = DEFAULT_ROWS, cols: number = DEFAULT_COLS) => {
  const [cells, setCells] = useState<Map<string, CellData>>(new Map());

  const updateCell = useCallback((pos: CellPosition, rawValue: string) => {
    const ref = indexToCell(pos.row, pos.col);
    const type = detectType(rawValue);
    let computed: CellValue = parseValue(rawValue, type);
    const newCell: CellData = { raw: rawValue, computed, type };
    setCells(prev => new Map(prev).set(ref, newCell));
  }, []);

  const getCell = useCallback((pos: CellPosition): CellData | undefined => {
    const ref = indexToCell(pos.row, pos.col);
    return cells.get(ref);
  }, [cells]);

  const getCellRaw = useCallback((pos: CellPosition): string => {
    return getCell(pos)?.raw ?? '';
  }, [getCell]);

  const getDisplayValue = useCallback((pos: CellPosition): string => {
    const cell = getCell(pos);
    if (!cell) return '';
    return String(cell.computed);
  }, [getCell]);

  return {
    cells,
    updateCell,
    getCell,
    getCellRaw,
    getDisplayValue,
    rows,
    cols,
  };
};