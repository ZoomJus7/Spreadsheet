import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDocumentById, clearCurrentDocument } from '@/store/slices/documentsSlice';
import { Spreadsheet } from '@/components/spreadsheet/Spreadsheet';

const SpreadsheetPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentDocument, loading } = useAppSelector((state) => state.documents);
  const { user } = useAppSelector((state) => state.auth);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (documentId && !hasFetched) {
      setHasFetched(true);
      dispatch(fetchDocumentById(documentId));
    }
  }, [documentId, dispatch, hasFetched]);

  useEffect(() => {
    if (!loading && !currentDocument && documentId && hasFetched) {
      navigate('/404', { replace: true });
    }
  }, [loading, currentDocument, documentId, navigate, hasFetched]);

  useEffect(() => {
    if (!loading && currentDocument && user && currentDocument.userId !== user.id) {
      alert('У вас нет доступа к этому документу');
      navigate('/dashboard', { replace: true });
    }
  }, [loading, currentDocument, user, navigate]);

  const handleBack = useCallback(() => {
    dispatch(clearCurrentDocument());
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 50);
  }, [dispatch, navigate]);

  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка документа...</div>;
  }

  if (!currentDocument || !documentId) {
    return <div style={{ padding: 20 }}>Документ не найден</div>;
  }

  if (user && currentDocument.userId !== user.id) {
    return <div style={{ padding: 20 }}>Доступ запрещён</div>;
  }

  const cellsMap = new Map();
  Object.entries(currentDocument.cells).forEach(([key, value]) => {
    cellsMap.set(key, value);
  });

  return (
    <Spreadsheet
      documentId={documentId}
      documentName={currentDocument.name}
      rows={currentDocument.rows}
      cols={currentDocument.cols}
      cells={cellsMap}
      onBack={handleBack}
    />
  );
};

export default SpreadsheetPage;