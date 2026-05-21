import type { CellData } from '@/types/spreadsheet';
import { detectType, parseValue } from './spreadsheet/cellTypeDetector';
import { indexToCell } from './formulas/cellReference';

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const importFromCSV = (file: File): Promise<{
  cells: Map<string, CellData>;
  rows: number;
  cols: number;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length === 0) {
        reject(new Error('Файл пуст'));
        return;
      }
      const data = lines.map(line => parseCSVLine(line));
      const rows = data.length;
      const cols = Math.max(...data.map(r => r.length));
      const cells = new Map<string, CellData>();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const raw = data[r][c] ?? '';
          const type = detectType(raw);
          const computed = type === 'formula' ? raw : parseValue(raw, type);
          const ref = indexToCell(r, c);
          cells.set(ref, { raw, computed, type });
        }
      }
      resolve({ cells, rows, cols });
    };
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
};