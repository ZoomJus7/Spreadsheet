export type CellValue = string | number | boolean;

export interface CellStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  numberFormat?: 'general' | 'number' | 'percent' | 'currency' | 'date';
}

export interface CellData {
  raw: string;
  computed: CellValue;
  type: 'text' | 'number' | 'boolean' | 'formula';
  styles?: CellStyles;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
}