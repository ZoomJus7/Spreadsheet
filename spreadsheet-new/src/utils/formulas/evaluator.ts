import { Parser } from 'hot-formula-parser';
import { cellToIndex } from './cellReference';
import type { CellValue } from '@/types/spreadsheet';

export function evaluateFormula(
  formula: string,
  getCellValue: (ref: string) => CellValue
): { error?: string; result?: CellValue } {
  const parser = new Parser();

  parser.on('callCellValue', (cellCoord: any, done: (value: CellValue) => void) => {
    const row = cellCoord.row.index;
    const col = cellCoord.column.index;
    const colLetter = cellCoord.column.label;
    const ref = `${colLetter}${row + 1}`;
    const value = getCellValue(ref);
    done(value);
  });

  parser.on('callRangeValue', (startCellCoord: any, endCellCoord: any, done: (values: CellValue[][]) => void) => {
    const startRow = startCellCoord.row.index;
    const startCol = startCellCoord.column.index;
    const endRow = endCellCoord.row.index;
    const endCol = endCellCoord.column.index;

    const values: CellValue[][] = [];
    for (let r = startRow; r <= endRow; r++) {
      const rowValues: CellValue[] = [];
      for (let c = startCol; c <= endCol; c++) {
        const colLetter = String.fromCharCode(65 + c);
        const ref = `${colLetter}${r + 1}`;
        rowValues.push(getCellValue(ref));
      }
      values.push(rowValues);
    }
    done(values);
  });

  try {
    const result = parser.parse(formula.substring(1));
    if (result.error) {
      const errorMessage = typeof result.error === 'string' ? result.error : '#ERROR';
      return { error: errorMessage };
    }
    return { result: result.result as CellValue };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '#ERROR';
    return { error: errorMessage };
  }
}