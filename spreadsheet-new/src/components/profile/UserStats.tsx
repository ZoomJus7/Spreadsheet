import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getUserStats } from '@/services/mockAuthService';

export const UserStats: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<{ documentCount: number; registeredAt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (user?.id) {
        try {
          const data = await getUserStats(user.id);
          setStats(data);
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      }
    };
    loadStats();
  }, [user]);

  if (loading) return <div className="profile-section">Загрузка статистики...</div>;
  if (!stats) return null;

  return (
    <div className="profile-section">
      <h3>Статистика</h3>
      <div className="stats-item">
        <span>Количество документов:</span>
        <strong>{stats.documentCount}</strong>
      </div>
      <div className="stats-item">
        <span>Дата регистрации:</span>
        <strong>{new Date(stats.registeredAt).toLocaleDateString()}</strong>
      </div>
    </div>
  );
};