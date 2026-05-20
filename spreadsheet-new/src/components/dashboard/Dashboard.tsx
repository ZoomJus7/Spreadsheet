import React, { useState, useEffect, useCallback } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCard } from './DocumentCard';
import { CreateDocumentModal } from './CreateDocumentModal';
import { getDocumentById } from '@/services/mockApi';
import { indexToCell } from '@/utils/formulas/cellReference';
import type { PreviewCells } from '@/types/document';
import '@/styles/dashboard.css';

interface DashboardProps {
  onSelectDocument: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectDocument }) => {
  const { documents, loading, add, rename, remove, duplicate, refresh } = useDocuments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previews, setPreviews] = useState<Record<string, PreviewCells>>({});

  const loadPreviews = useCallback(async () => {
    const newPreviews: Record<string, PreviewCells> = {};
    for (const doc of documents) {
      const fullDoc = await getDocumentById(doc.id);
      if (fullDoc) {
        const preview: PreviewCells = [];
        for (let r = 0; r < Math.min(3, fullDoc.rows); r++) {
          const row: (string | number | boolean)[] = [];
          for (let c = 0; c < Math.min(3, fullDoc.cols); c++) {
            const ref = indexToCell(r, c);
            const cell = fullDoc.cells[ref];
            row.push(cell ? cell.computed : '');
          }
          preview.push(row);
        }
        newPreviews[doc.id] = preview;
      }
    }
    setPreviews(newPreviews);
  }, [documents]);

  useEffect(() => {
    if (documents.length > 0) {
      loadPreviews();
    }
  }, [documents, loadPreviews]);

  const handleCreate = async (name: string, rows: number, cols: number) => {
    const newDoc = await add(name, rows, cols);
    if (newDoc) {
      onSelectDocument(newDoc.id);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Мои документы</h1>
        <div>
          <button onClick={() => setIsCreateOpen(true)}>+ Новый документ</button>
          <button onClick={refresh}>Обновить</button>
        </div>
      </div>
      <div className="documents-grid">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onOpen={onSelectDocument}
            onRename={rename}
            onDelete={remove}
            onDuplicate={duplicate}
            preview={previews[doc.id] || []}
          />
        ))}
      </div>
      <CreateDocumentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};