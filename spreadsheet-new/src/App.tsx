import React, { useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { Spreadsheet } from './components/spreadsheet/Spreadsheet';

function App() {
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  if (currentDocId) {
    return <Spreadsheet documentId={currentDocId} onBack={() => setCurrentDocId(null)} />;
  }

  return <Dashboard onSelectDocument={setCurrentDocId} />;
}

export default App;