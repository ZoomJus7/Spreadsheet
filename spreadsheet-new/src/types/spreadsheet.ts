export type CellValue = string | number | boolean;

export interface CellData {
  raw: string;
  computed: CellValue;
  type: 'text' | 'number' | 'boolean' | 'formula';
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
}