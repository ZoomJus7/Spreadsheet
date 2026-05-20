import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'cell' | 'rowHeader' | 'colHeader';
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onDeleteRow: () => void;
  onAddColumnLeft: () => void;
  onAddColumnRight: () => void;
  onDeleteColumn: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  onAddRowAbove,
  onAddRowBelow,
  onDeleteRow,
  onAddColumnLeft,
  onAddColumnRight,
  onDeleteColumn,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 1000,
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
    padding: '4px 0',
    minWidth: '150px',
  };

  return (
    <div ref={menuRef} style={style} className="context-menu">
      {(type === 'rowHeader' || type === 'cell') && (
        <>
          <button onClick={onAddRowAbove}>Add row above</button>
          <button onClick={onAddRowBelow}>Add row below</button>
          <button onClick={onDeleteRow}>Delete row</button>
        </>
      )}
      {(type === 'colHeader' || type === 'cell') && (
        <>
          <button onClick={onAddColumnLeft}>Add column left</button>
          <button onClick={onAddColumnRight}>Add column right</button>
          <button onClick={onDeleteColumn}>Delete column</button>
        </>
      )}
    </div>
  );
};