import { useState, useCallback, useEffect } from 'react';
import type { ResizeState, ResizeDirection } from '@/types/resize';
import { clamp } from '@/utils/resizeUtils';

export const useResize = (
  initialColumnWidths: Record<number, number>,
  initialRowHeights: Record<number, number>,
  minWidth: number = 40,
  maxWidth: number = 400,
  minHeight: number = 20,
  maxHeight: number = 200
) => {
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>(initialColumnWidths);
  const [rowHeights, setRowHeights] = useState<Record<number, number>>(initialRowHeights);
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    direction: null,
    index: -1,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const startResize = useCallback((direction: ResizeDirection, index: number, clientX: number, clientY: number) => {
    setResizeState({
      isResizing: true,
      direction,
      index,
      startX: clientX,
      startY: clientY,
      startWidth: columnWidths[index] ?? 100,
      startHeight: rowHeights[index] ?? 25,
    });
  }, [columnWidths, rowHeights]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.isResizing) return;
    if (resizeState.direction === 'column') {
      const delta = e.clientX - resizeState.startX;
      let newWidth = resizeState.startWidth + delta;
      newWidth = clamp(newWidth, minWidth, maxWidth);
      setColumnWidths(prev => ({ ...prev, [resizeState.index]: newWidth }));
    } else if (resizeState.direction === 'row') {
      const delta = e.clientY - resizeState.startY;
      let newHeight = resizeState.startHeight + delta;
      newHeight = clamp(newHeight, minHeight, maxHeight);
      setRowHeights(prev => ({ ...prev, [resizeState.index]: newHeight }));
    }
  }, [resizeState, minWidth, maxWidth, minHeight, maxHeight]);

  const stopResize = useCallback(() => {
    setResizeState({
      isResizing: false,
      direction: null,
      index: -1,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
    });
  }, []);

  useEffect(() => {
    if (resizeState.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResize);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopResize);
      };
    }
  }, [resizeState.isResizing, handleMouseMove, stopResize]);

  return {
    columnWidths,
    rowHeights,
    startResize,
  };
};