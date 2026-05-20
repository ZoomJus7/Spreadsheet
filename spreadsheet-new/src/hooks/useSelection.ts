import { useState, useCallback } from 'react';
import type { CellPosition, SelectionRange } from '@/types/spreadsheet';

export const useSelection = () => {
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(null);
  const [anchorCell, setAnchorCell] = useState<CellPosition | null>(null);

  const selectCell = useCallback((pos: CellPosition, withShift: boolean = false) => {
    if (!withShift || !anchorCell) {
      setSelectedCell(pos);
      setAnchorCell(pos);
      setSelectedRange(null);
    } else {
      const startRow = Math.min(anchorCell.row, pos.row);
      const endRow = Math.max(anchorCell.row, pos.row);
      const startCol = Math.min(anchorCell.col, pos.col);
      const endCol = Math.max(anchorCell.col, pos.col);
      setSelectedRange({
        start: { row: startRow, col: startCol },
        end: { row: endRow, col: endCol },
      });
      setSelectedCell(pos);
    }
  }, [anchorCell]);

  const clearSelection = useCallback(() => {
    setSelectedCell(null);
    setSelectedRange(null);
    setAnchorCell(null);
  }, []);

  return {
    selectedCell,
    selectedRange,
    selectCell,
    clearSelection,
  };
};