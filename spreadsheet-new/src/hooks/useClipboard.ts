import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCell, updateRangeStyles, selectAllCells } from '@/store/slices/spreadsheetSlice';
import type { CellStyles } from '@/types/spreadsheet';

export const useClipboard = () => {
  const dispatch = useAppDispatch();
  const { cells, selectedCell, selectedRange, rows, cols } = useAppSelector((state) => state.spreadsheet);
  
  const copyToClipboard = useCallback(async () => {
    let startRow: number, startCol: number, endRow: number, endCol: number;
    
    if (selectedRange) {
      startRow = selectedRange.start.row;
      startCol = selectedRange.start.col;
      endRow = selectedRange.end.row;
      endCol = selectedRange.end.col;
    } else if (selectedCell) {
      startRow = selectedCell.row;
      startCol = selectedCell.col;
      endRow = selectedCell.row;
      endCol = selectedCell.col;
    } else {
      return;
    }
    
    const copyRows = endRow - startRow + 1;
    const copyCols = endCol - startCol + 1;
    const copyData: string[][] = [];
    const stylesData: (CellStyles | undefined)[][] = [];
    
    for (let r = startRow; r <= endRow; r++) {
      const rowData: string[] = [];
      const styleRow: (CellStyles | undefined)[] = [];
      for (let c = startCol; c <= endCol; c++) {
        const ref = `${String.fromCharCode(65 + c)}${r + 1}`;
        const cell = cells.get(ref);
        rowData.push(cell?.raw ?? '');
        styleRow.push(cell?.styles);
      }
      copyData.push(rowData);
      stylesData.push(styleRow);
    }
    
    const clipboardItem = {
      type: 'spreadsheet',
      data: copyData,
      styles: stylesData,
      rows: copyRows,
      cols: copyCols,
    };
    
    await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
  }, [cells, selectedCell, selectedRange]);
  
  const cutToClipboard = useCallback(async () => {
    await copyToClipboard();
    
    let startRow: number, startCol: number, endRow: number, endCol: number;
    
    if (selectedRange) {
      startRow = selectedRange.start.row;
      startCol = selectedRange.start.col;
      endRow = selectedRange.end.row;
      endCol = selectedRange.end.col;
    } else if (selectedCell) {
      startRow = selectedCell.row;
      startCol = selectedCell.col;
      endRow = selectedCell.row;
      endCol = selectedCell.col;
    } else {
      return;
    }
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        dispatch(updateCell({ pos: { row: r, col: c }, rawValue: '' }));
      }
    }
  }, [copyToClipboard, dispatch, selectedCell, selectedRange]);
  
  const pasteFromClipboard = useCallback(async () => {
    if (!selectedCell) return;
    
    const text = await navigator.clipboard.readText();
    let parsedData: any;
    
    try {
      parsedData = JSON.parse(text);
      if (parsedData.type !== 'spreadsheet') throw new Error('Not spreadsheet data');
    } catch {
      return;
    }
    
    const { data, styles, rows: copyRows, cols: copyCols } = parsedData;
    const startRow = selectedCell.row;
    const startCol = selectedCell.col;
    
    for (let r = 0; r < copyRows && startRow + r < rows; r++) {
      for (let c = 0; c < copyCols && startCol + c < cols; c++) {
        const rawValue = data[r]?.[c] ?? '';
        if (rawValue !== '') {
          dispatch(updateCell({ pos: { row: startRow + r, col: startCol + c }, rawValue }));
        }
        if (styles?.[r]?.[c]) {
          dispatch(updateRangeStyles({
            range: {
              start: { row: startRow + r, col: startCol + c },
              end: { row: startRow + r, col: startCol + c },
            },
            styles: styles[r][c],
          }));
        }
      }
    }
  }, [selectedCell, dispatch, rows, cols]);
  
  const selectAll = useCallback(() => {
    dispatch(selectAllCells());
  }, [dispatch]);
  
  const clearCell = useCallback(() => {
    if (selectedRange) {
      const { start, end } = selectedRange;
      for (let r = start.row; r <= end.row; r++) {
        for (let c = start.col; c <= end.col; c++) {
          dispatch(updateCell({ pos: { row: r, col: c }, rawValue: '' }));
        }
      }
    } else if (selectedCell) {
      dispatch(updateCell({ pos: selectedCell, rawValue: '' }));
    }
  }, [dispatch, selectedCell, selectedRange]);
  
  return {
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    selectAll,
    clearCell,
  };
};