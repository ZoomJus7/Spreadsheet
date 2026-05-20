import React from 'react';
import { COLUMN_LETTERS } from '@/constants/defaultConfig';

interface ColHeaderProps {
  cols: number;
  columnWidths: Record<number, number>;
  onStartResize: (direction: 'column', index: number, clientX: number, clientY: number) => void;
  onContextMenu: (e: React.MouseEvent, colIndex: number) => void;
}

export const ColHeader: React.FC<ColHeaderProps> = ({ cols, columnWidths, onStartResize, onContextMenu }) => {
  const getWidth = (index: number) => columnWidths[index] ?? 100;

  const getLetter = (index: number): string => {
    let result = '';
    let i = index;
    while (i >= 0) {
      result = COLUMN_LETTERS[i % 26] + result;
      i = Math.floor(i / 26) - 1;
    }
    return result;
  };

  const handleMouseDown = (e: React.MouseEvent, colIndex: number) => {
    if (e.clientX > e.currentTarget.getBoundingClientRect().right - 4) {
      onStartResize('column', colIndex, e.clientX, e.clientY);
      e.preventDefault();
    }
  };

  return (
    <div className="col-headers">
      {Array.from({ length: cols }).map((_, idx) => (
        <div
          key={idx}
          className="col-header"
          style={{ width: getWidth(idx), display: 'inline-block' }}
          onMouseDown={(e) => handleMouseDown(e, idx)}
          onContextMenu={(e) => onContextMenu(e, idx)}
        >
          {getLetter(idx)}
          <div className="resize-handle-col" />
        </div>
      ))}
    </div>
  );
};