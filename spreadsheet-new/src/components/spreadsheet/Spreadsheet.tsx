import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateCell,
  selectCell,
  clearSelection,
  insertRow,
  deleteRow,
  insertColumn,
  deleteColumn,
  setCellsFromImport,
  updateCellStyles,
  updateRangeStyles,
  undo,
  redo,
} from '@/store/slices/spreadsheetSlice';
import { clearCurrentDocument } from '@/store/slices/documentsSlice';
import { updateDocument } from '@/services/mockApi';
import { useEditing } from '@/hooks/useEditing';
import { useResize } from '@/hooks/useResize';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';
import { importFromCSV } from '@/utils/importUtils';
import { Grid } from './Grid';
import { FormulaBar } from './FormulaBar';
import { ContextMenu } from './ContextMenu';
import { FormattingToolbar } from './FormattingToolbar';
import type { CellStyles } from '@/types/spreadsheet';
import '@/styles/spreadsheet.css';

interface SpreadsheetProps {
  documentId: string;
  documentName: string;
  rows: number;
  cols: number;
  cells: Map<string, any>;
  onBack: () => void;
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({ 
  documentId, 
  documentName,
  rows: initialRows,
  cols: initialCols,
  cells: initialCells,
  onBack,
}) => {
  const dispatch = useAppDispatch();
  const { cells, rows, cols, selectedCell, selectedRange } = useAppSelector((state) => state.spreadsheet);
  const { saveStatus } = useAppSelector((state) => state.ui);
  const { columnWidths, rowHeights, startResize } = useResize({}, {});
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const { editingCell, startEdit, stopEdit, inputRef } = useEditing();
  const [formulaValue, setFormulaValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTableFocused, setIsTableFocused] = useState(true);

  const currentStyles = useMemo(() => {
    if (!selectedCell) return {};
    const ref = `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`;
    const cell = cells.get(ref);
    return cell?.styles || {};
  }, [selectedCell, cells]);

  useEffect(() => {
    if (!isInitialized && initialCells) {
      dispatch(setCellsFromImport({ cells: new Map(initialCells), rows: initialRows, cols: initialCols }));
      setIsInitialized(true);
    }
  }, [dispatch, initialCells, initialRows, initialCols, isInitialized]);

  useEffect(() => {
    if (selectedCell && !editingCell) {
      const ref = `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`;
      const cell = cells.get(ref);
      setFormulaValue(cell?.raw ?? '');
    }
  }, [selectedCell, cells, editingCell]);

  useEffect(() => {
    const saveCurrentDocument = async () => {
      const cellsObject: Record<string, any> = {};
      cells.forEach((value, key) => {
        cellsObject[key] = value;
      });
      
      try {
        await updateDocument(documentId, {
          cells: cellsObject,
          rows,
          cols,
        });
      } catch (err) {
        console.error('Manual save failed', err);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        saveCurrentDocument();
        return false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [documentId, cells, rows, cols]);

  useEffect(() => {
    const handleSelectAll = (e: CustomEvent) => {
      const { rows: totalRows, cols: totalCols } = e.detail;
      dispatch(selectCell({ pos: { row: 0, col: 0 }, withShift: false }));
      setTimeout(() => {
        dispatch(selectCell({ pos: { row: totalRows - 1, col: totalCols - 1 }, withShift: true }));
      }, 0);
    };
    
    window.addEventListener('spreadsheet:selectAll', handleSelectAll as EventListener);
    return () => window.removeEventListener('spreadsheet:selectAll', handleSelectAll as EventListener);
  }, [dispatch, rows, cols]);

  useEffect(() => {
    const handleFocus = () => setIsTableFocused(true);
    const handleBlur = () => setIsTableFocused(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const getCellRaw = useCallback((pos: { row: number; col: number }) => {
    const ref = `${String.fromCharCode(65 + pos.col)}${pos.row + 1}`;
    const cell = cells.get(ref);
    return cell?.raw ?? '';
  }, [cells]);

  const getDisplayValue = useCallback((pos: { row: number; col: number }) => {
    const ref = `${String.fromCharCode(65 + pos.col)}${pos.row + 1}`;
    const cell = cells.get(ref);
    return cell ? String(cell.computed) : '';
  }, [cells]);

  const getCellStyles = useCallback((pos: { row: number; col: number }): CellStyles => {
    const ref = `${String.fromCharCode(65 + pos.col)}${pos.row + 1}`;
    const cell = cells.get(ref);
    return cell?.styles || {};
  }, [cells]);

  const handleEditCommit = useCallback((row: number, col: number, value: string) => {
    dispatch(updateCell({ pos: { row, col }, rawValue: value }));
    stopEdit();
  }, [dispatch, stopEdit]);

  const handleStartEdit = useCallback((row: number, col: number) => {
    startEdit({ row, col });
  }, [startEdit]);

  const handleSelectCell = useCallback((row: number, col: number, withShift: boolean) => {
    if (row >= 0 && col >= 0) {
      dispatch(selectCell({ pos: { row, col }, withShift }));
      if (editingCell) stopEdit();
    } else {
      dispatch(clearSelection());
    }
  }, [dispatch, editingCell, stopEdit]);

  const handleStyleChange = useCallback((styles: Partial<CellStyles>) => {
    if (selectedRange && selectedRange.start && selectedRange.end) {
      dispatch(updateRangeStyles({ range: selectedRange, styles }));
    } else if (selectedCell) {
      dispatch(updateCellStyles({ pos: selectedCell, styles }));
    }
  }, [dispatch, selectedCell, selectedRange]);

  const handleFormulaChange = (value: string) => setFormulaValue(value);
  
  const handleFormulaCommit = () => {
    if (selectedCell) {
      dispatch(updateCell({ pos: selectedCell, rawValue: formulaValue }));
      stopEdit();
    }
  };
  
  const handleFormulaCancel = () => {
    if (selectedCell) {
      const ref = `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`;
      const cell = cells.get(ref);
      setFormulaValue(cell?.raw ?? '');
    }
    stopEdit();
  };

  const handleExportCSV = () => exportToCSV(rows, cols, (r, c) => getDisplayValue({ row: r, col: c }));
  const handleExportJSON = () => exportToJSON(rows, cols, (r, c) => getCellRaw({ row: r, col: c }));
  
  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const { cells: newCells, rows: newRows, cols: newCols } = await importFromCSV(file);
          dispatch(setCellsFromImport({ cells: newCells, rows: newRows, cols: newCols }));
        } catch {
          alert('Ошибка импорта CSV');
        }
      }
    };
    input.click();
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'cell' | 'rowHeader' | 'colHeader', index?: number, row?: number, col?: number) => {
    openContextMenu(e, type, index, row !== undefined && col !== undefined ? { row, col } : undefined);
  };

  const handleAddRowAbove = () => {
    let target = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) target = contextMenu.index;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.row;
    if (target !== -1) dispatch(insertRow(target));
    closeContextMenu();
  };

  const handleAddRowBelow = () => {
    let target = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) target = contextMenu.index + 1;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.row + 1;
    if (target !== -1 && target <= rows) dispatch(insertRow(target));
    closeContextMenu();
  };

  const handleDeleteRow = () => {
    let target = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) target = contextMenu.index;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.row;
    if (target !== -1) dispatch(deleteRow(target));
    closeContextMenu();
  };

  const handleAddColumnLeft = () => {
    let target = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) target = contextMenu.index;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.col;
    if (target !== -1) dispatch(insertColumn(target));
    closeContextMenu();
  };

  const handleAddColumnRight = () => {
    let target = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) target = contextMenu.index + 1;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.col + 1;
    if (target !== -1 && target <= cols) dispatch(insertColumn(target));
    closeContextMenu();
  };

  const handleDeleteColumn = () => {
    let target = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) target = contextMenu.index;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.col;
    if (target !== -1) dispatch(deleteColumn(target));
    closeContextMenu();
  };

  const handleBack = () => {
    dispatch(clearCurrentDocument());
    onBack();
  };

  const getStatusText = () => {
    if (saveStatus === 'saving') return 'Сохранение...';
    if (saveStatus === 'saved') return 'Сохранено';
    if (saveStatus === 'error') return 'Ошибка';
    return '✓';
  };

  const handleMoveRight = useCallback(() => {
    if (selectedCell && selectedCell.col < cols - 1) {
      dispatch(selectCell({ pos: { row: selectedCell.row, col: selectedCell.col + 1 }, withShift: false }));
    }
  }, [dispatch, selectedCell, cols]);

  const handleMoveLeft = useCallback(() => {
    if (selectedCell && selectedCell.col > 0) {
      dispatch(selectCell({ pos: { row: selectedCell.row, col: selectedCell.col - 1 }, withShift: false }));
    }
  }, [dispatch, selectedCell]);

  const handleMoveDown = useCallback(() => {
    if (selectedCell && selectedCell.row < rows - 1) {
      dispatch(selectCell({ pos: { row: selectedCell.row + 1, col: selectedCell.col }, withShift: false }));
    }
  }, [dispatch, selectedCell, rows]);

  const handleMoveUp = useCallback(() => {
    if (selectedCell && selectedCell.row > 0) {
      dispatch(selectCell({ pos: { row: selectedCell.row - 1, col: selectedCell.col }, withShift: false }));
    }
  }, [dispatch, selectedCell]);

  const handleBold = useCallback(() => {
    handleStyleChange({ bold: !currentStyles.bold });
  }, [handleStyleChange, currentStyles.bold]);

  const handleItalic = useCallback(() => {
    handleStyleChange({ italic: !currentStyles.italic });
  }, [handleStyleChange, currentStyles.italic]);

  const handleUnderline = useCallback(() => {
    handleStyleChange({ underline: !currentStyles.underline });
  }, [handleStyleChange, currentStyles.underline]);

  const handleUndo = useCallback(() => {
    dispatch(undo());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redo());
  }, [dispatch]);

  useKeyboardShortcuts({
    onBold: handleBold,
    onItalic: handleItalic,
    onUnderline: handleUnderline,
    onMoveRight: handleMoveRight,
    onMoveLeft: handleMoveLeft,
    onMoveDown: handleMoveDown,
    onMoveUp: handleMoveUp,
    onExitEdit: () => stopEdit(),
    onUndo: handleUndo,
    onRedo: handleRedo,
    isEditing: !!editingCell,
    isActive: isTableFocused,
  });

  if (!isInitialized) {
    return <div style={{ padding: 20 }}>Загрузка таблицы...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px', background: '#f0f0f0', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #ccc', flexWrap: 'wrap' }}>
        <button onClick={handleBack}>← Назад</button>
        <span style={{ fontWeight: 'bold' }}>{documentName}</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: saveStatus === 'error' ? 'red' : '#555' }}>
          {getStatusText()}
        </span>
        <button onClick={handleExportCSV}>CSV</button>
        <button onClick={handleExportJSON}>JSON</button>
        <button onClick={handleImportCSV}>Импорт CSV</button>
      </div>
      <FormattingToolbar onStyleChange={handleStyleChange} currentStyles={currentStyles} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <FormulaBar
          value={formulaValue}
          onChange={handleFormulaChange}
          onCommit={handleFormulaCommit}
          onCancel={handleFormulaCancel}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <Grid
            rows={rows}
            cols={cols}
            columnWidths={columnWidths}
            rowHeights={rowHeights}
            selectedCell={selectedCell}
            selectedRange={selectedRange}
            editingCell={editingCell}
            getCellRaw={getCellRaw}
            getDisplayValue={getDisplayValue}
            getCellStyles={getCellStyles}
            onEditCommit={handleEditCommit}
            onStartEdit={handleStartEdit}
            onSelectCell={handleSelectCell}
            onStartResize={startResize}
            onContextMenu={handleContextMenu}
          />
        </div>
        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            type={contextMenu.type}
            onAddRowAbove={handleAddRowAbove}
            onAddRowBelow={handleAddRowBelow}
            onDeleteRow={handleDeleteRow}
            onAddColumnLeft={handleAddColumnLeft}
            onAddColumnRight={handleAddColumnRight}
            onDeleteColumn={handleDeleteColumn}
            onClose={closeContextMenu}
          />
        )}
      </div>
    </div>
  );
};