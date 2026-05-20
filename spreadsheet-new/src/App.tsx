import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { undo, redo } from './store/slices/spreadsheetSlice';
import { Dashboard } from './components/dashboard/Dashboard';
import { Spreadsheet } from './components/spreadsheet/Spreadsheet';
import { useAppSelector } from './store/hooks';

function App() {
  const dispatch = useDispatch();
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
    // Здесь нужно будет установить активный документ
    console.log('Selected document:', id);
  };

  const handleBack = () => {
    // Здесь нужно будет очистить активный документ
    console.log('Back to dashboard');
  };

  if (currentDocument) {
    return <Spreadsheet documentId={currentDocument.id} onBack={handleBack} />;
  }

  return <Dashboard onSelectDocument={handleSelectDocument} />;
}

export default App;