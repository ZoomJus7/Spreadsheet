import React from 'react';
import { ColorPicker } from './ColorPicker';
import { NumberFormatSelect } from './NumberFormatSelect';
import type { CellStyles } from '@/types/spreadsheet';

interface FormattingToolbarProps {
  onStyleChange: (styles: Partial<CellStyles>) => void;
  currentStyles?: CellStyles;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onStyleChange, currentStyles }) => {
  return (
    <div className="formatting-toolbar">
      <button
        onClick={() => onStyleChange({ bold: !currentStyles?.bold })}
        className={`toolbar-btn ${currentStyles?.bold ? 'active' : ''}`}
        title="Жирный (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => onStyleChange({ italic: !currentStyles?.italic })}
        className={`toolbar-btn ${currentStyles?.italic ? 'active' : ''}`}
        title="Курсив (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => onStyleChange({ underline: !currentStyles?.underline })}
        className={`toolbar-btn ${currentStyles?.underline ? 'active' : ''}`}
        title="Подчёркивание (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <div className="toolbar-divider" />
      <button
        onClick={() => onStyleChange({ textAlign: 'left' })}
        className={`toolbar-btn ${currentStyles?.textAlign === 'left' ? 'active' : ''}`}
        title="По левому краю"
      >
        ⬅️
      </button>
      <button
        onClick={() => onStyleChange({ textAlign: 'center' })}
        className={`toolbar-btn ${currentStyles?.textAlign === 'center' ? 'active' : ''}`}
        title="По центру"
      >
        ⬌
      </button>
      <button
        onClick={() => onStyleChange({ textAlign: 'right' })}
        className={`toolbar-btn ${currentStyles?.textAlign === 'right' ? 'active' : ''}`}
        title="По правому краю"
      >
        ➡️
      </button>
      <div className="toolbar-divider" />
      <ColorPicker
        label="Цвет фона"
        value={currentStyles?.backgroundColor}
        onChange={(color) => onStyleChange({ backgroundColor: color || undefined })}
      />
      <ColorPicker
        label="Цвет текста"
        value={currentStyles?.textColor}
        onChange={(color) => onStyleChange({ textColor: color || undefined })}
      />
      <div className="toolbar-divider" />
      <NumberFormatSelect
        value={currentStyles?.numberFormat || 'general'}
        onChange={(format) => onStyleChange({ numberFormat: format })}
      />
    </div>
  );
};