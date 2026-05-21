import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { removeTokens } from '@/utils/tokenUtils';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import '@/styles/layout.css';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    removeTokens();
    dispatch(logout());
    navigate('/login');
  };

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
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </header>
      <div className="breadcrumbs-wrapper">
        <Breadcrumbs />
      </div>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;