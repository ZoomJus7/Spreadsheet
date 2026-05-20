import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useAppSelector } from '@/store/hooks';
import '@/styles/layout.css';

const AppLayout: React.FC = () => {
  const currentDocument = useAppSelector((state) => state.documents.currentDocument);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo">
          <Link to="/dashboard">Spreadsheet App</Link>
        </div>
        <nav className="app-nav">
          <Link to="/dashboard">Мои документы</Link>
          <Link to="/profile">Профиль</Link>
        </nav>
      </header>
      <div className="breadcrumbs-wrapper">
        <Breadcrumbs documentName={currentDocument?.name} />
      </div>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;