import React, { useEffect } from 'react';
import { undo, redo } from './store/slices/spreadsheetSlice';
import { fetchDocumentById, clearCurrentDocument } from './store/slices/documentsSlice';
import { Dashboard } from './components/dashboard/Dashboard';
import { Spreadsheet } from './components/spreadsheet/Spreadsheet';
import { useAppSelector, useAppDispatch } from './store/hooks';

function App() {
  const dispatch = useAppDispatch();
  const currentDocument = useAppSelector((state) => state.documents.currentDocument);

  useEffect(() => {
    const handleUndoRedo = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch(redo());
      }
    };
    window.addEventListener('keydown', handleUndoRedo);
    return () => window.removeEventListener('keydown', handleUndoRedo);
  }, [dispatch]);

  const handleSelectDocument = (id: string) => {
    console.log('Opening document:', id);
    dispatch(fetchDocumentById(id));
  };

  const handleBack = () => {
    console.log('Back to dashboard');
    dispatch(clearCurrentDocument());
  };

  if (currentDocument) {
    return <Spreadsheet documentId={currentDocument.id} onBack={handleBack} />;
  }

  return <Dashboard onSelectDocument={handleSelectDocument} />;
}

export default App;