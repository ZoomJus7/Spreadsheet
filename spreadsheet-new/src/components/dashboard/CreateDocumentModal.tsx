import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, rows: number, cols: number) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('Новая таблица');
  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(26);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), rows, cols);
      setName('Новая таблица');
      setRows(100);
      setCols(26);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создать документ">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label>Строки</label>
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            min={1}
            max={500}
          />
        </div>
        <div>
          <label>Столбцы</label>
          <input
            type="number"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            min={1}
            max={100}
          />
        </div>
        <div className="modal-buttons">
          <button type="submit">Создать</button>
          <button type="button" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </Modal>
  );
};