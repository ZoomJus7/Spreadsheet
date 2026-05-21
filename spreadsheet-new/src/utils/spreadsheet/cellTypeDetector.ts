import type { CellValue } from '@/types/spreadsheet';

export function detectType(raw: string): 'text' | 'number' | 'boolean' | 'formula' {
  if (raw.startsWith('=')) return 'formula';
  if (raw === 'true' || raw === 'false') return 'boolean';
  const num = Number(raw);
  if (!isNaN(num) && raw.trim() !== '') return 'number';
  return 'text';
}

export function parseValue(raw: string, type: 'text' | 'number' | 'boolean' | 'formula'): CellValue {
  if (type === 'number') return Number(raw);
  if (type === 'boolean') return raw === 'true';
  if (type === 'formula') return raw;
  return raw;
}