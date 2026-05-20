import React from 'react';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange, onCommit, onCancel }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="formula-bar">
      <span className="formula-label">fx</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
      />
    </div>
  );
};