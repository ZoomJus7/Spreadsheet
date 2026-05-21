import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbsProps {
  documentName?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ documentName }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getDisplayName = (path: string, value: string) => {
    if (path === 'documents' && documentName) {
      return documentName;
    }
    if (path === 'dashboard') return 'Мои документы';
    if (path === 'profile') return 'Профиль';
    return value;
  };

  return (
    <div className="breadcrumbs">
      <Link to="/dashboard">Главная</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = getDisplayName(name, name);

        return (
          <span key={name}>
            {' / '}
            {isLast ? (
              <span className="breadcrumb-current">{displayName}</span>
            ) : (
              <Link to={routeTo}>{displayName}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
};