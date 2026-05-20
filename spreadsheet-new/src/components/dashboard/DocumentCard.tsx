import React, { useState } from 'react';
import type { DocumentMeta } from '@/types/document';
import { RenameDocumentModal } from './RenameDocumentModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface DocumentCardProps {
  document: DocumentMeta;
  onOpen: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  preview: (string | number | boolean)[][];
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onOpen,
  onRename,
  onDelete,
  onDuplicate,
  preview,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="document-card">
      <div className="document-preview">
        {preview.length > 0 ? (
          <table className="preview-table">
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{String(cell ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="preview-empty">—</div>
        )}
      </div>
      <div className="document-info">
        <h4>{document.name}</h4>
        <div>Создан: {formatDate(document.createdAt)}</div>
        <div>Изменён: {formatDate(document.updatedAt)}</div>
        <div>Размер: {document.rows} × {document.cols}</div>
      </div>
      <div className="document-actions">
        <button onClick={() => onOpen(document.id)}>Открыть</button>
        <button onClick={() => setIsRenameOpen(true)}>Переименовать</button>
        <button onClick={() => onDuplicate(document.id)}>Дублировать</button>
        <button onClick={() => setIsDeleteOpen(true)}>Удалить</button>
      </div>

      <RenameDocumentModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        onRename={(newName) => onRename(document.id, newName)}
        currentName={document.name}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDelete(document.id)}
        documentName={document.name}
      />
    </div>
  );
};