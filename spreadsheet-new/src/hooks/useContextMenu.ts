import { useState, useCallback, useEffect } from 'react';
import type { CellPosition } from '@/types/spreadsheet';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: 'cell' | 'rowHeader' | 'colHeader';
  index?: number;
  cellPos?: CellPosition;
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    type: 'cell',
  });

  const openContextMenu = useCallback((
    e: React.MouseEvent,
    type: 'cell' | 'rowHeader' | 'colHeader',
    index?: number,
    cellPos?: CellPosition
  ) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type,
      index,
      cellPos,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [closeContextMenu]);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
};