import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateCell,
  selectCell,
  clearSelection,
  insertRow,
  deleteRow,
  insertColumn,
  deleteColumn,
  loadDocumentData,
  setCellsFromImport,
} from '@/store/slices/spreadsheetSlice';
import { fetchDocumentById, clearCurrentDocument } from '@/store/slices/documentsSlice';
import { useEditing } from '@/hooks/useEditing';
import { useResize } from '@/hooks/useResize';
import { useContextMenu } from '@/hooks/useContextMenu';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';
import { importFromCSV } from '@/utils/importUtils';
import { Grid } from './Grid';
import { FormulaBar } from './FormulaBar';
import { ContextMenu } from './ContextMenu';
import '@/styles/spreadsheet.css';

interface SpreadsheetProps {
  documentId: string;
  onBack: () => void;
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({ documentId, onBack }) => {
  const dispatch = useAppDispatch();
  const { cells, rows, cols, selectedCell, selectedRange } = useAppSelector((state) => state.spreadsheet);
  const { currentDocument, loading } = useAppSelector((state) => state.documents);
  const { saveStatus } = useAppSelector((state) => state.ui);
  const { columnWidths, rowHeights, startResize } = useResize({}, {});
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const { editingCell, startEdit, stopEdit, inputRef } = useEditing();
  const [formulaValue, setFormulaValue] = useState('');

  useEffect(() => {
    if (documentId) {
      dispatch(fetchDocumentById(documentId));
    }
  }, [dispatch, documentId]);

  useEffect(() => {
    if (currentDocument && currentDocument.id === documentId) {
      dispatch(loadDocumentData({
        cells: currentDocument.cells,
        rows: currentDocument.rows,
        cols: currentDocument.cols,
      }));
    }
  }, [dispatch, currentDocument, documentId]);

  useEffect(() => {
    if (selectedCell && !editingCell) {
      const ref = `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`;
      const cell = cells.get(ref);
      setFormulaValue(cell?.raw ?? '');
    }
  }, [selectedCell, cells, editingCell]);

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

  if (loading) return <div style={{ padding: 20 }}>Загрузка документа...</div>;
  if (!currentDocument) return <div style={{ padding: 20 }}>Документ не найден</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px', background: '#f0f0f0', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #ccc', flexWrap: 'wrap' }}>
        <button onClick={handleBack}>← Назад</button>
        <span style={{ fontWeight: 'bold' }}>{currentDocument.name}</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: saveStatus === 'error' ? 'red' : '#555' }}>
          {getStatusText()}
        </span>
        <button onClick={handleExportCSV}>CSV</button>
        <button onClick={handleExportJSON}>JSON</button>
        <button onClick={handleImportCSV}>Импорт CSV</button>
      </div>
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