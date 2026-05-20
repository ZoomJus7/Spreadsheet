import React, { useCallback, useEffect, useState } from 'react';
import { useSpreadsheetData } from '@/hooks/useSpreadsheetData';
import { useSelection } from '@/hooks/useSelection';
import { useEditing } from '@/hooks/useEditing';
import { useResize } from '@/hooks/useResize';
import { useContextMenu } from '@/hooks/useContextMenu';
import { DEFAULT_ROWS, DEFAULT_COLS } from '@/constants/defaultConfig';
import { SimpleGrid as Grid } from './SimpleGrid';
import { FormulaBar } from './FormulaBar';
import { ContextMenu } from './ContextMenu';
import '@/styles/spreadsheet.css';

export const Spreadsheet: React.FC = () => {
  const {
    updateCell,
    getCellRaw,
    getDisplayValue,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    rows,
    cols,
  } = useSpreadsheetData(DEFAULT_ROWS, DEFAULT_COLS);

  const { selectedCell, selectedRange, selectCell, clearSelection } = useSelection();
  const { columnWidths, rowHeights, startResize } = useResize({}, {});
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const { editingCell, startEdit, stopEdit, inputRef } = useEditing();

  const [formulaValue, setFormulaValue] = useState('');

  useEffect(() => {
    if (selectedCell && !editingCell) {
      setFormulaValue(getCellRaw(selectedCell));
    }
  }, [selectedCell, getCellRaw, editingCell]);

  useEffect(() => {
    if (editingCell && selectedCell) {
      setFormulaValue(getCellRaw(selectedCell));
    }
  }, [editingCell, selectedCell, getCellRaw]);

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
      if (editingCell) {
        stopEdit();
      }
    } else {
      clearSelection();
    }
  }, [selectCell, clearSelection, editingCell, stopEdit]);

  const handleFormulaChange = useCallback((value: string) => {
    setFormulaValue(value);
  }, []);

  const handleFormulaCommit = useCallback(() => {
    if (selectedCell) {
      updateCell(selectedCell, formulaValue);
      stopEdit();
    }
  }, [selectedCell, formulaValue, updateCell, stopEdit]);

  const handleFormulaCancel = useCallback(() => {
    if (selectedCell) {
      setFormulaValue(getCellRaw(selectedCell));
    }
    stopEdit();
  }, [selectedCell, getCellRaw, stopEdit]);

  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    type: 'cell' | 'rowHeader' | 'colHeader',
    index?: number,
    row?: number,
    col?: number
  ) => {
    openContextMenu(e, type, index, row !== undefined && col !== undefined ? { row, col } : undefined);
  }, [openContextMenu]);

  const handleAddRowAbove = useCallback(() => {
    let targetRow = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) {
      targetRow = contextMenu.index;
    } else if (contextMenu.type === 'cell' && contextMenu.cellPos) {
      targetRow = contextMenu.cellPos.row;
    }
    if (targetRow !== -1) insertRow(targetRow);
    closeContextMenu();
  }, [contextMenu, insertRow, closeContextMenu]);

  const handleAddRowBelow = useCallback(() => {
    let targetRow = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) {
      targetRow = contextMenu.index + 1;
    } else if (contextMenu.type === 'cell' && contextMenu.cellPos) {
      targetRow = contextMenu.cellPos.row + 1;
    }
    if (targetRow !== -1 && targetRow <= rows) insertRow(targetRow);
    closeContextMenu();
  }, [contextMenu, insertRow, closeContextMenu, rows]);

  const handleDeleteRow = useCallback(() => {
    let targetRow = -1;
    if (contextMenu.type === 'rowHeader' && contextMenu.index !== undefined) {
      targetRow = contextMenu.index;
    } else if (contextMenu.type === 'cell' && contextMenu.cellPos) {
      targetRow = contextMenu.cellPos.row;
    }
    if (targetRow !== -1) deleteRow(targetRow);
    closeContextMenu();
  }, [contextMenu, deleteRow, closeContextMenu]);

  const handleAddColumnLeft = useCallback(() => {
    let targetCol = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) {
      targetCol = contextMenu.index;
    } else if (contextMenu.type === 'cell' && contextMenu.cellPos) {
      targetCol = contextMenu.cellPos.col;
    }
    if (targetCol !== -1) insertColumn(targetCol);
    closeContextMenu();
  }, [contextMenu, insertColumn, closeContextMenu]);

  const handleAddColumnRight = useCallback(() => {
    let targetCol = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) {
      targetCol = contextMenu.index + 1;
    } else if (contextMenu.type === 'cell' && contextMenu.cellPos) {
      targetCol = contextMenu.cellPos.col + 1;
    }
    if (targetCol !== -1 && targetCol <= cols) insertColumn(targetCol);
    closeContextMenu();
  }, [contextMenu, insertColumn, closeContextMenu, cols]);

  const handleDeleteColumn = useCallback(() => {
    let targetCol = -1;
    if (contextMenu.type === 'colHeader' && contextMenu.index !== undefined) {
      targetCol = contextMenu.index;
    } else if (contextMenu.type === 'cell' && contextMenu.cellPos) {
      targetCol = contextMenu.cellPos.col;
    }
    if (targetCol !== -1) deleteColumn(targetCol);
    closeContextMenu();
  }, [contextMenu, deleteColumn, closeContextMenu]);

  return (
    <div className="spreadsheet-container">
      <FormulaBar
        value={formulaValue}
        onChange={handleFormulaChange}
        onCommit={handleFormulaCommit}
        onCancel={handleFormulaCancel}
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
  );
};