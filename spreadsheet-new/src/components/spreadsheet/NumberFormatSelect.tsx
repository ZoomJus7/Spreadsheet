import React from 'react';

type NumberFormat = 'general' | 'number' | 'percent' | 'currency' | 'date';

interface NumberFormatSelectProps {
  value: NumberFormat;
  onChange: (format: NumberFormat) => void;
}

const formats: { value: NumberFormat; label: string }[] = [
  { value: 'general', label: 'Общий' },
  { value: 'number', label: 'Число' },
  { value: 'percent', label: 'Процент' },
  { value: 'currency', label: 'Валюта' },
  { value: 'date', label: 'Дата' },
];

export const NumberFormatSelect: React.FC<NumberFormatSelectProps> = ({ value, onChange }) => {
  return (
    <select
      className="number-format-select"
      value={value}
      onChange={(e) => onChange(e.target.value as NumberFormat)}
    >
      {formats.map((f) => (
        <option key={f.value} value={f.value}>
          {f.label}
        </option>
      ))}
    </select>
  );
};