import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDocuments, createNewDocument, renameDocument, deleteDocumentThunk, duplicateDocumentThunk } from '@/store/slices/documentsSlice';
import { 
  openCreateModal, 
  closeCreateModal, 
  openRenameModal, 
  closeRenameModal, 
  openDeleteModal, 
  closeDeleteModal 
} from '@/store/slices/uiSlice';
import { DocumentCard } from './DocumentCard';
import { CreateDocumentModal } from './CreateDocumentModal';
import { RenameDocumentModal } from './RenameDocumentModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { getDocumentById } from '@/services/mockApi';
import { indexToCell } from '@/utils/formulas/cellReference';
import type { PreviewCells } from '@/types/document';
import '@/styles/dashboard.css';

interface DashboardProps {
  onSelectDocument: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectDocument }) => {
  const dispatch = useAppDispatch();
  const { list: documents, loading } = useAppSelector((state) => state.documents);
  const { isCreateModalOpen, isRenameModalOpen, isDeleteModalOpen, modalData } = useAppSelector((state) => state.ui);
  const [previews, setPreviews] = useState<Record<string, PreviewCells>>({});

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  useEffect(() => {
    const loadPreviews = async () => {
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
    };
    if (documents.length > 0) {
      loadPreviews();
    }
  }, [documents]);

  const handleCreate = useCallback(async (name: string, rows: number, cols: number) => {
    const result = await dispatch(createNewDocument({ name, rows, cols }));
    if (createNewDocument.fulfilled.match(result)) {
      onSelectDocument(result.payload.id);
    }
    dispatch(closeCreateModal());
  }, [dispatch, onSelectDocument]);

  const handleRename = useCallback(async (newName: string) => {
    const id = modalData.documentId;
    if (id) {
      await dispatch(renameDocument({ id, newName }));
    }
    dispatch(closeRenameModal());
  }, [dispatch, modalData.documentId]);

  const handleDelete = useCallback(async () => {
    const id = modalData.documentId;
    if (id) {
      await dispatch(deleteDocumentThunk(id));
    }
    dispatch(closeDeleteModal());
  }, [dispatch, modalData.documentId]);

  const handleDuplicate = useCallback(async (id: string) => {
    await dispatch(duplicateDocumentThunk(id));
  }, [dispatch]);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Мои документы</h1>
        <div>
          <button onClick={() => dispatch(openCreateModal())}>+ Новый документ</button>
        </div>
      </div>
      <div className="documents-grid">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onOpen={onSelectDocument}
            onRename={(id, name) => dispatch(openRenameModal({ documentId: id, currentName: name }))}
            onDelete={(id, name) => dispatch(openDeleteModal({ documentId: id, documentName: name }))}
            onDuplicate={handleDuplicate}
            preview={previews[doc.id] || []}
          />
        ))}
      </div>
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(closeCreateModal())}
        onCreate={handleCreate}
      />
      <RenameDocumentModal
        isOpen={isRenameModalOpen}
        onClose={() => dispatch(closeRenameModal())}
        onRename={handleRename}
        currentName={modalData.currentName || ''}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => dispatch(closeDeleteModal())}
        onConfirm={handleDelete}
        documentName={modalData.documentName || ''}
      />
    </div>
  );
};