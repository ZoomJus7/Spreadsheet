import React from 'react';

interface RowHeaderProps {
  rows: number;
  rowHeights: Record<number, number>;
  onStartResize: (direction: 'row', index: number, clientX: number, clientY: number) => void;
  onContextMenu: (e: React.MouseEvent, rowIndex: number) => void;
}

export const RowHeader: React.FC<RowHeaderProps> = ({ rows, rowHeights, onStartResize, onContextMenu }) => {
  const getHeight = (index: number) => rowHeights[index] ?? 25;

  const handleMouseDown = (e: React.MouseEvent, rowIndex: number) => {
    if (e.clientY > e.currentTarget.getBoundingClientRect().bottom - 4) {
      onStartResize('row', rowIndex, e.clientX, e.clientY);
      e.preventDefault();
    }
  };

  return (
    <div className="row-headers">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="row-header"
          style={{ height: getHeight(idx), lineHeight: `${getHeight(idx)}px` }}
          onMouseDown={(e) => handleMouseDown(e, idx)}
          onContextMenu={(e) => onContextMenu(e, idx)}
        >
          {idx + 1}
          <div className="resize-handle-row" />
        </div>
      ))}
    </div>
  );
};