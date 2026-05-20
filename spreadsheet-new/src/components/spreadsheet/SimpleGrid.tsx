import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { Cell } from './Cell';
import { RowHeader } from './RowHeader';
import { ColHeader } from './ColHeader';
import type { CellPosition, SelectionRange } from '@/types/spreadsheet';
import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from '@/constants/defaultConfig';

interface SimpleGridProps {
  rows: number;
  cols: number;
  columnWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  selectedCell: CellPosition | null;
  selectedRange: SelectionRange | null;
  editingCell: CellPosition | null;
  getCellRaw: (pos: CellPosition) => string;
  getDisplayValue: (pos: CellPosition) => string;
  onEditCommit: (row: number, col: number, value: string) => void;
  onStartEdit: (row: number, col: number) => void;
  onSelectCell: (row: number, col: number, withShift: boolean) => void;
  onStartResize: (direction: 'column' | 'row', index: number, clientX: number, clientY: number) => void;
  onContextMenu: (e: React.MouseEvent, type: 'cell' | 'rowHeader' | 'colHeader', index?: number, row?: number, col?: number) => void;
}

export const SimpleGrid: React.FC<SimpleGridProps> = ({
  rows,
  cols,
  columnWidths,
  rowHeights,
  selectedCell,
  selectedRange,
  editingCell,
  getCellRaw,
  getDisplayValue,
  onEditCommit,
  onStartEdit,
  onSelectCell,
  onStartResize,
  onContextMenu,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const colHeaderRef = useRef<HTMLDivElement | null>(null);
  const rowHeaderRef = useRef<HTMLDivElement | null>(null);

  const getColumnWidth = (index: number): number => columnWidths[index] ?? DEFAULT_COLUMN_WIDTH;
  const getRowHeight = (index: number): number => rowHeights[index] ?? DEFAULT_ROW_HEIGHT;

  // Вычисление общей ширины и высоты
  let totalWidth = 0;
  for (let i = 0; i < cols; i++) totalWidth += getColumnWidth(i);
  let totalHeight = 0;
  for (let i = 0; i < rows; i++) totalHeight += getRowHeight(i);

  // Предварительный расчёт позиций строк и столбцов
  const rowTops: number[] = [];
  let currentTop = 0;
  for (let i = 0; i < rows; i++) {
    rowTops.push(currentTop);
    currentTop += getRowHeight(i);
  }

  const colLefts: number[] = [];
  let currentLeft = 0;
  for (let i = 0; i < cols; i++) {
    colLefts.push(currentLeft);
    currentLeft += getColumnWidth(i);
  }

  // Обработчики прокрутки с нативными событиями
  const handleBodyScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    if (!target) return;
    const scrollLeft = target.scrollLeft;
    const scrollTop = target.scrollTop;
    if (colHeaderRef.current) colHeaderRef.current.scrollLeft = scrollLeft;
    if (rowHeaderRef.current) rowHeaderRef.current.scrollTop = scrollTop;
  };

  const handleColHeaderScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    if (target && bodyRef.current) {
      bodyRef.current.scrollLeft = target.scrollLeft;
    }
  };

  const handleRowHeaderScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    if (target && bodyRef.current) {
      bodyRef.current.scrollTop = target.scrollTop;
    }
  };

  // Навешивание обработчиков после монтирования
  useEffect(() => {
    colHeaderRef.current = document.querySelector('.col-headers');
    rowHeaderRef.current = document.querySelector('.row-headers');
    const colHeaderElem = colHeaderRef.current;
    const rowHeaderElem = rowHeaderRef.current;
    const bodyElem = bodyRef.current;

    if (colHeaderElem) {
      colHeaderElem.addEventListener('scroll', handleColHeaderScroll);
    }
    if (rowHeaderElem) {
      rowHeaderElem.addEventListener('scroll', handleRowHeaderScroll);
    }
    if (bodyElem) {
      bodyElem.addEventListener('scroll', handleBodyScroll);
    }

    // Синхронизация начальных положений
    if (bodyElem && colHeaderElem) colHeaderElem.scrollLeft = bodyElem.scrollLeft;
    if (bodyElem && rowHeaderElem) rowHeaderElem.scrollTop = bodyElem.scrollTop;

    return () => {
      if (colHeaderElem) colHeaderElem.removeEventListener('scroll', handleColHeaderScroll);
      if (rowHeaderElem) rowHeaderElem.removeEventListener('scroll', handleRowHeaderScroll);
      if (bodyElem) bodyElem.removeEventListener('scroll', handleBodyScroll);
    };
  }, []);

  // Синхронизация при изменении размеров
  useLayoutEffect(() => {
    if (bodyRef.current && colHeaderRef.current) {
      colHeaderRef.current.scrollLeft = bodyRef.current.scrollLeft;
    }
    if (bodyRef.current && rowHeaderRef.current) {
      rowHeaderRef.current.scrollTop = bodyRef.current.scrollTop;
    }
  }, [columnWidths, rowHeights]);

  return (
    <div className="spreadsheet-grid">
      <div className="top-left-corner" />
      <ColHeader
        cols={cols}
        columnWidths={columnWidths}
        onStartResize={onStartResize}
        onContextMenu={(e, colIndex) => onContextMenu(e, 'colHeader', colIndex)}
      />
      <RowHeader
        rows={rows}
        rowHeights={rowHeights}
        onStartResize={onStartResize}
        onContextMenu={(e, rowIndex) => onContextMenu(e, 'rowHeader', rowIndex)}
      />
      <div
        ref={bodyRef}
        className="grid-body"
        style={{ overflow: 'auto', position: 'relative' }}
      >
        <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const rowHeight = getRowHeight(rowIndex);
            const rowTop = rowTops[rowIndex];
            return (
              <div key={rowIndex} style={{ position: 'absolute', top: rowTop, height: rowHeight, width: '100%' }}>
                {Array.from({ length: cols }).map((_, colIndex) => {
                  const colWidth = getColumnWidth(colIndex);
                  const colLeft = colLefts[colIndex];
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isInRange = selectedRange
                    ? rowIndex >= selectedRange.start.row && rowIndex <= selectedRange.end.row &&
                      colIndex >= selectedRange.start.col && colIndex <= selectedRange.end.col
                    : false;
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  const value = getDisplayValue({ row: rowIndex, col: colIndex });
                  const initialValue = getCellRaw({ row: rowIndex, col: colIndex });

                  return (
                    <Cell
                      key={`${rowIndex}-${colIndex}`}
                      row={rowIndex}
                      col={colIndex}
                      value={value}
                      isSelected={isSelected}
                      isInRange={isInRange}
                      isEditing={isEditing}
                      initialValue={initialValue}
                      onCommit={onEditCommit}
                      onSelect={onSelectCell}
                      onStartEdit={onStartEdit}
                      style={{ position: 'absolute', left: colLeft, width: colWidth, height: rowHeight }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};