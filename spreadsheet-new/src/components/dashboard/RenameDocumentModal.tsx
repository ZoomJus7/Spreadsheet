import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';

interface RenameDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
}

export const RenameDocumentModal: React.FC<RenameDocumentModalProps> = ({
  isOpen,
  onClose,
  onRename,
  currentName,
}) => {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Переименовать документ">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Новое название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="modal-buttons">
          <button type="submit">Сохранить</button>
          <button type="button" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </Modal>
  );
};