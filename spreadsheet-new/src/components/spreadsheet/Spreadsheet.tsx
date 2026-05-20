import React from 'react';
import { useSpreadsheetData } from '@/hooks/useSpreadsheetData';
import { useSelection } from '@/hooks/useSelection';
import { useEditing } from '@/hooks/useEditing';
import { useResize } from '@/hooks/useResize';
import { useContextMenu } from '@/hooks/useContextMenu';
import { DEFAULT_ROWS, DEFAULT_COLS } from '@/constants/defaultConfig';
import { Grid } from './Grid';
import { FormulaBar } from './FormulaBar';
import { ContextMenu } from './ContextMenu';
import '@/styles/spreadsheet.css';

interface SpreadsheetProps {
  documentId: string;
  onBack: () => void;
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({ documentId, onBack }) => {
  console.log('Spreadsheet mounted with documentId:', documentId);

  const {
    updateCell,
    getCellRaw,
    getDisplayValue,
    rows,
    cols,
  } = useSpreadsheetData(DEFAULT_ROWS, DEFAULT_COLS);

  const { selectedCell, selectedRange, selectCell, clearSelection } = useSelection();
  const { columnWidths, rowHeights, startResize } = useResize({}, {});
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const { editingCell, startEdit, stopEdit, inputRef } = useEditing();

  const handleEditCommit = (row: number, col: number, value: string) => {
    updateCell({ row, col }, value);
    stopEdit();
  };

  const handleStartEdit = (row: number, col: number) => {
    startEdit({ row, col });
  };

  const handleSelectCell = (row: number, col: number, withShift: boolean) => {
    if (row >= 0 && col >= 0) {
      selectCell({ row, col }, withShift);
      if (editingCell) stopEdit();
    } else {
      clearSelection();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'cell' | 'rowHeader' | 'colHeader', index?: number, row?: number, col?: number) => {
    openContextMenu(e, type, index, row !== undefined && col !== undefined ? { row, col } : undefined);
  };

  const handleAddRowAbove = () => {
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) {
      console.log('Add row above', contextMenu.index);
    }
    closeContextMenu();
  };

  const handleAddRowBelow = () => {
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) {
      console.log('Add row below', contextMenu.index + 1);
    }
    closeContextMenu();
  };

  const handleDeleteRow = () => {
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) {
      console.log('Delete row', contextMenu.index);
    }
    closeContextMenu();
  };

  const handleAddColumnLeft = () => {
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) {
      console.log('Add column left', contextMenu.index);
    }
    closeContextMenu();
  };

  const handleAddColumnRight = () => {
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) {
      console.log('Add column right', contextMenu.index + 1);
    }
    closeContextMenu();
  };

  const handleDeleteColumn = () => {
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) {
      console.log('Delete column', contextMenu.index);
    }
    closeContextMenu();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px', background: '#f0f0f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={onBack}>← Назад</button>
        <span>Документ: {documentId}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <FormulaBar
          value=""
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
        />
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