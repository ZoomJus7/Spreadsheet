import { useEffect, useRef, useState, useCallback } from 'react';
import { updateDocument } from '@/services/mockApi';
import type { CellData } from '@/types/spreadsheet';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useAutoSave = (
  documentId: string | null,
  cells: Map<string, CellData>,
  rows: number,
  cols: number,
  debounceMs: number = 500
) => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<number | null>(null);
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const getCellsObject = useCallback((): Record<string, CellData> => {
    const obj: Record<string, CellData> = {};
    cells.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [cells]);

  const saveNow = useCallback(async () => {
    if (!documentId) return;
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      setStatus('saving');
      await updateDocument(documentId, {
        cells: getCellsObject(),
        rows,
        cols,
      });
      lastSavedRef.current = JSON.stringify(getCellsObject());
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    } finally {
      isSavingRef.current = false;
    }
  }, [documentId, getCellsObject, rows, cols]);

  useEffect(() => {
    if (!documentId) return;
    
    const currentHash = JSON.stringify(getCellsObject());
    if (currentHash === lastSavedRef.current) return;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      saveNow();
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [documentId, cells, rows, cols, debounceMs, saveNow, getCellsObject]);

  return { status, saveNow };
};