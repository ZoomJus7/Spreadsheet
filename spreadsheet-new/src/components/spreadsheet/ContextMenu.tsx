import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'cell' | 'rowHeader' | 'colHeader';
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  onAddRow,
  onDeleteRow,
  onAddColumn,
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
  };

  return (
    <div ref={menuRef} style={style} className="context-menu">
      {(type === 'rowHeader' || type === 'cell') && (
        <>
          <button onClick={onAddRow}>Add row above</button>
          <button onClick={onDeleteRow}>Delete row</button>
        </>
      )}
      {(type === 'colHeader' || type === 'cell') && (
        <>
          <button onClick={onAddColumn}>Add column left</button>
          <button onClick={onDeleteColumn}>Delete column</button>
        </>
      )}
    </div>
  );
};