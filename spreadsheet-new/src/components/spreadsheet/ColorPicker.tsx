import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label: string;
  icon?: string;
}

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#FFC0CB', '#808080', '#C0C0C0', '#800000',
  '#808000', '#008080', '#000080',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="color-picker" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="color-picker-btn"
        title={label}
        style={{ backgroundColor: value || '#fff', border: '1px solid #ccc' }}
      >
        {icon || '🎨'}
      </button>
      {isOpen && (
        <div className="color-picker-dropdown">
          {colors.map((color) => (
            <div
              key={color}
              className="color-option"
              style={{ backgroundColor: color }}
              onClick={() => {
                onChange(color);
                setIsOpen(false);
              }}
            />
          ))}
          <button
            className="color-clear"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
          >
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
};