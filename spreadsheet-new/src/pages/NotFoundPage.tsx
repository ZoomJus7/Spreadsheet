import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <h1>404</h1>
      <p>Страница не найдена</p>
      <Link to="/dashboard">Вернуться на главную</Link>
    </div>
  );
};

export default NotFoundPage;