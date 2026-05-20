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
    rows,
    cols,
  } = useSpreadsheetData(DEFAULT_ROWS, DEFAULT_COLS);

  const { selectedCell, selectedRange, selectCell, clearSelection } = useSelection();
  const { columnWidths, rowHeights, startResize } = useResize({}, {});
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const { editingCell, startEdit, stopEdit, inputRef } = useEditing();

  const [formulaValue, setFormulaValue] = useState('');

  // Обновление формулы при смене выбранной ячейки
  useEffect(() => {
    if (selectedCell && !editingCell) {
      setFormulaValue(getCellRaw(selectedCell));
    }
  }, [selectedCell, getCellRaw, editingCell]);

  // Если редактируем ячейку, формульная строка показывает её текущее значение
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
    // Опционально: можно обновлять ячейку в реальном времени (раскомментировать при желании)
    // if (selectedCell && !editingCell) {
    //   updateCell(selectedCell, value);
    // }
  }, [selectedCell, editingCell, updateCell]);

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

  // Заглушки для контекстного меню (в дальнейшем будут реализованы)
  const handleAddRow = useCallback(() => closeContextMenu(), [closeContextMenu]);
  const handleDeleteRow = useCallback(() => closeContextMenu(), [closeContextMenu]);
  const handleAddColumn = useCallback(() => closeContextMenu(), [closeContextMenu]);
  const handleDeleteColumn = useCallback(() => closeContextMenu(), [closeContextMenu]);

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
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};