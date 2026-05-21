import { useState, useCallback, useRef } from 'react';
import type { CellPosition } from '@/types/spreadsheet';

export const useEditing = () => {
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback((pos: CellPosition) => {
    setEditingCell(pos);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, []);

  const stopEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  return {
    editingCell,
    startEdit,
    stopEdit,
    inputRef,
  };
};