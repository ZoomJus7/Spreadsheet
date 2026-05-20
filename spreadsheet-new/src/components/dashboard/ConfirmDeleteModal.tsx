import React from 'react';
import { Modal } from '@/components/common/Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentName: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Удалить документ">
      <p>Вы уверены, что хотите удалить «{documentName}»?</p>
      <div className="modal-buttons">
        <button onClick={onConfirm}>Удалить</button>
        <button onClick={onClose}>Отмена</button>
      </div>
    </Modal>
  );
};