import React, { memo, useRef, useEffect } from 'react';

interface CellProps {
  row: number;
  col: number;
  value: string;
  isSelected: boolean;
  isInRange: boolean;
  isEditing: boolean;
  initialValue: string;
  onCommit: (row: number, col: number, value: string) => void;
  onSelect: (row: number, col: number, withShift: boolean) => void;
  onStartEdit: (row: number, col: number) => void;
  style: React.CSSProperties;
}

export const Cell: React.FC<CellProps> = memo(({
  row,
  col,
  value,
  isSelected,
  isInRange,
  isEditing,
  initialValue,
  onCommit,
  onSelect,
  onStartEdit,
  style,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit(row, col, inputRef.current?.value || '');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // отмена редактирования – просто закрываем, без сохранения
      // и вызываем onSelect, чтобы снять фокус
      onSelect(row, col, false);
    }
  };

  const handleBlur = () => {
    onCommit(row, col, inputRef.current?.value || '');
  };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(row, col, e.shiftKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit(row, col);
  };

  let className = 'spreadsheet-cell';
  if (isSelected) className += ' selected';
  if (isInRange && !isSelected) className += ' range';

  return (
    <div
      className={className}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          defaultValue={initialValue}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <div className="cell-content">{value}</div>
      )}
    </div>
  );
});