import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { updateUserName } from '@/services/mockAuthService';

export const ProfileForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Имя не может быть пустым' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await updateUserName(user.id, name.trim());
      dispatch(updateUser({ name: name.trim() }));
      setMessage({ type: 'success', text: 'Имя успешно обновлено' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при обновлении имени' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <h3>Личная информация</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email || ''} disabled />
        </div>
        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
          />
        </div>
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
};