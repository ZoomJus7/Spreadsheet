import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spreadsheet } from '@/components/spreadsheet/Spreadsheet';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCurrentDocument, fetchDocumentById } from '@/store/slices/documentsSlice';

const SpreadsheetPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentDocument, loading } = useAppSelector((state) => state.documents);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (documentId) {
      dispatch(fetchDocumentById(documentId));
    }
  }, [dispatch, documentId]);

  // Проверка доступа к документу
  useEffect(() => {
    if (!loading && currentDocument) {
      // Проверяем, принадлежит ли документ текущему пользователю
      if (currentDocument.userId !== user?.id) {
        alert('У вас нет доступа к этому документу');
        navigate('/dashboard');
      }
    }
  }, [loading, currentDocument, user, navigate]);

  useEffect(() => {
    if (!loading && !currentDocument && documentId) {
      navigate('/404');
    }
  }, [loading, currentDocument, documentId, navigate]);

  const handleBack = () => {
    dispatch(clearCurrentDocument());
    navigate('/dashboard');
  };

  if (!documentId) {
    return <div style={{ padding: 20 }}>Документ не найден</div>;
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка документа...</div>;
  }

  if (!currentDocument) {
    return <div style={{ padding: 20 }}>Документ не найден</div>;
  }

  // Проверка userId
  if (currentDocument.userId !== user?.id) {
    return <div style={{ padding: 20 }}>Доступ запрещён</div>;
  }

  // Преобразуем cells из Record в Map
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