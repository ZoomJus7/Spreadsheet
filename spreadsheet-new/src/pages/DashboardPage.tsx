import React from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  return <Dashboard onSelectDocument={handleSelectDocument} />;
};

export default DashboardPage;