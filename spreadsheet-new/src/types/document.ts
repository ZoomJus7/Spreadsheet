import type { CellData } from './spreadsheet';

export interface Document {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  rows: number;
  cols: number;
  cells: Record<string, CellData>;
}

export interface DocumentMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  rows: number;
  cols: number;
}

export type PreviewCells = (string | number | boolean)[][];