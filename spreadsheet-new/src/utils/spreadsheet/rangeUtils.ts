import { cellToIndex } from '../formulas/cellReference';
import type { CellPosition, SelectionRange } from '@/types/spreadsheet';

export function parseRange(rangeStr: string): { start: CellPosition; end: CellPosition } | null {
  const parts = rangeStr.split(':');
  if (parts.length !== 2) return null;
  const start = cellToIndex(parts[0]);
  const end = cellToIndex(parts[1]);
  if (!start || !end) return null;
  return {
    start: { row: Math.min(start.row, end.row), col: Math.min(start.col, end.col) },
    end: { row: Math.max(start.row, end.row), col: Math.max(start.col, end.col) },
  };
}

export function getCellsInRange(range: SelectionRange): CellPosition[] {
  const cells: CellPosition[] = [];
  for (let r = range.start.row; r <= range.end.row; r++) {
    for (let c = range.start.col; c <= range.end.col; c++) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}