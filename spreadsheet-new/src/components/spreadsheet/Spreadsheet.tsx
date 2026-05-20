import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSpreadsheetData } from '@/hooks/useSpreadsheetData';
import { useSelection } from '@/hooks/useSelection';
import { useEditing } from '@/hooks/useEditing';
import { useResize } from '@/hooks/useResize';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { getDocumentById } from '@/services/mockApi';
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
  const [loading, setLoading] = useState(true);
  const [docName, setDocName] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedHashRef = useRef('');

  const {
    cells,
    rows,
    cols,
    updateCell,
    getCellRaw,
    getDisplayValue,
    loadDocumentData,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
  } = useSpreadsheetData(100, 26);

  const { status: saveStatus, saveNow } = useAutoSave(documentId, cells, rows, cols, 500);
  const { selectedCell, selectedRange, selectCell, clearSelection } = useSelection();
  const { columnWidths, rowHeights, startResize } = useResize({}, {});
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const { editingCell, startEdit, stopEdit, inputRef } = useEditing();
  const [formulaValue, setFormulaValue] = useState('');

  useBeforeUnload(isDirty);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const doc = await getDocumentById(documentId);
      if (doc) {
        setDocName(doc.name);
        loadDocumentData(doc.cells, doc.rows, doc.cols);
      } else {
        alert('Документ не найден');
        onBack();
      }
      setLoading(false);
    };
    load();
  }, [documentId, loadDocumentData, onBack]);

  useEffect(() => {
    const hash = JSON.stringify(Array.from(cells.entries()));
    setIsDirty(hash !== lastSavedHashRef.current);
    if (!loading) {
      lastSavedHashRef.current = hash;
    }
  }, [cells, loading]);

  useEffect(() => {
    const handleCtrlS = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    };
    window.addEventListener('keydown', handleCtrlS);
    return () => window.removeEventListener('keydown', handleCtrlS);
  }, [saveNow]);

  useEffect(() => {
    if (selectedCell && !editingCell) {
      setFormulaValue(getCellRaw(selectedCell));
    }
  }, [selectedCell, getCellRaw, editingCell]);

  const handleEditCommit = useCallback((row: number, col: number, value: string) => {
    updateCell({ row, col }, value);
    stopEdit();
  }, [updateCell, stopEdit]);

  const handleStartEdit = useCallback((row: number, col: number) => {
    startEdit({ row, col });
  }, [startEdit]);

  const handleSelectCell = useCallback((row: number, col: number, withShift: boolean) => {
    if (row >= 0 && col >= 0) {
      selectCell({ row, col }, withShift);
      if (editingCell) stopEdit();
    } else {
      clearSelection();
    }
  }, [selectCell, clearSelection, editingCell, stopEdit]);

  const handleFormulaChange = (value: string) => setFormulaValue(value);
  const handleFormulaCommit = () => {
    if (selectedCell) {
      updateCell(selectedCell, formulaValue);
      stopEdit();
    }
  };
  const handleFormulaCancel = () => {
    if (selectedCell) setFormulaValue(getCellRaw(selectedCell));
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
          loadDocumentData(Object.fromEntries(newCells), newRows, newCols);
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
    if (target !== -1) insertRow(target);
    closeContextMenu();
  };

  const handleAddRowBelow = () => {
    let target = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) target = contextMenu.index + 1;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.row + 1;
    if (target !== -1 && target <= rows) insertRow(target);
    closeContextMenu();
  };

  const handleDeleteRow = () => {
    let target = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) target = contextMenu.index;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.row;
    if (target !== -1) deleteRow(target);
    closeContextMenu();
  };

  const handleAddColumnLeft = () => {
    let target = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) target = contextMenu.index;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.col;
    if (target !== -1) insertColumn(target);
    closeContextMenu();
  };

  const handleAddColumnRight = () => {
    let target = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) target = contextMenu.index + 1;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.col + 1;
    if (target !== -1 && target <= cols) insertColumn(target);
    closeContextMenu();
  };

  const handleDeleteColumn = () => {
    let target = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) target = contextMenu.index;
    else if (contextMenu.type === 'cell' && contextMenu.cellPos) target = contextMenu.cellPos.col;
    if (target !== -1) deleteColumn(target);
    closeContextMenu();
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка документа...</div>;

  const getStatusText = () => {
    if (saveStatus === 'saving') return 'Сохранение...';
    if (saveStatus === 'saved') return 'Сохранено';
    if (saveStatus === 'error') return 'Ошибка';
    return '✓';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px', background: '#f0f0f0', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #ccc', flexWrap: 'wrap' }}>
        <button onClick={onBack}>← Назад</button>
        <span style={{ fontWeight: 'bold' }}>{docName}</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: saveStatus === 'error' ? 'red' : '#555' }}>
          {getStatusText()}
        </span>
        <button onClick={handleExportCSV}>CSV</button>
        <button onClick={handleExportJSON}>JSON</button>
        <button onClick={handleImportCSV}>Импорт CSV</button>
        <button onClick={saveNow}>💾 Ctrl+S</button>
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