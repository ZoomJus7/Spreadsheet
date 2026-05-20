import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { FixedSizeGrid as ReactWindowGrid } from 'react-window';
import { Cell } from './Cell';
import { RowHeader } from './RowHeader';
import { ColHeader } from './ColHeader';
import type { CellPosition, SelectionRange } from '@/types/spreadsheet';
import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from '@/constants/defaultConfig';

interface GridProps {
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

export const Grid: React.FC<GridProps> = ({
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
  const gridRef = useRef<ReactWindowGrid>(null);
  const colHeaderRef = useRef<HTMLDivElement | null>(null);
  const rowHeaderRef = useRef<HTMLDivElement | null>(null);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState({ width: 800, height: 600 });

  const columnWidth = DEFAULT_COLUMN_WIDTH;
  const rowHeight = DEFAULT_ROW_HEIGHT;

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: Math.max(rect.width, 100), height: Math.max(rect.height, 100) });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  const handleScroll = useCallback(({ scrollLeft, scrollTop }: { scrollLeft: number; scrollTop: number }) => {
    scrollLeftRef.current = scrollLeft;
    scrollTopRef.current = scrollTop;
    if (colHeaderRef.current) colHeaderRef.current.scrollLeft = scrollLeft;
    if (rowHeaderRef.current) rowHeaderRef.current.scrollTop = scrollTop;
  }, []);

  const handleColHeaderScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const left = e.currentTarget.scrollLeft;
    scrollLeftRef.current = left;
    if (gridRef.current) {
      gridRef.current.scrollTo({ scrollLeft: left, scrollTop: scrollTopRef.current });
    }
  }, []);

  const handleRowHeaderScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    scrollTopRef.current = top;
    if (gridRef.current) {
      gridRef.current.scrollTo({ scrollLeft: scrollLeftRef.current, scrollTop: top });
    }
  }, []);

  useEffect(() => {
    colHeaderRef.current = document.querySelector('.col-headers');
    rowHeaderRef.current = document.querySelector('.row-headers');
    const colElem = colHeaderRef.current;
    const rowElem = rowHeaderRef.current;
    if (colElem) {
      colElem.addEventListener('scroll', handleColHeaderScroll as any);
    }
    if (rowElem) {
      rowElem.addEventListener('scroll', handleRowHeaderScroll as any);
    }
    return () => {
      if (colElem) colElem.removeEventListener('scroll', handleColHeaderScroll as any);
      if (rowElem) rowElem.removeEventListener('scroll', handleRowHeaderScroll as any);
    };
  }, [handleColHeaderScroll, handleRowHeaderScroll]);

  const CellRenderer = useCallback(
    ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === columnIndex;
      const isInRange = selectedRange
        ? rowIndex >= selectedRange.start.row && rowIndex <= selectedRange.end.row &&
          columnIndex >= selectedRange.start.col && columnIndex <= selectedRange.end.col
        : false;
      const isEditing = editingCell?.row === rowIndex && editingCell?.col === columnIndex;
      const value = getDisplayValue({ row: rowIndex, col: columnIndex });
      const initialValue = getCellRaw({ row: rowIndex, col: columnIndex });

      return (
        <Cell
          row={rowIndex}
          col={columnIndex}
          value={value}
          isSelected={isSelected}
          isInRange={isInRange}
          isEditing={isEditing}
          initialValue={initialValue}
          onCommit={onEditCommit}
          onSelect={onSelectCell}
          onStartEdit={onStartEdit}
          style={style}
        />
      );
    },
    [selectedCell, selectedRange, editingCell, getDisplayValue, getCellRaw, onEditCommit, onSelectCell, onStartEdit]
  );

  return (
    <div className="spreadsheet-grid" style={{ height: '100%', width: '100%' }}>
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
      <div ref={containerRef} className="grid-body" style={{ width: '100%', height: '100%' }}>
        <ReactWindowGrid
          ref={gridRef}
          columnCount={cols}
          columnWidth={columnWidth}
          height={containerSize.height}
          rowCount={rows}
          rowHeight={rowHeight}
          width={containerSize.width}
          onScroll={handleScroll}
        >
          {CellRenderer}
        </ReactWindowGrid>
      </div>
    </div>
  );
};