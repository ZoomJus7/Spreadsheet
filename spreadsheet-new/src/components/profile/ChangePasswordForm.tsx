import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { changeUserPassword } from '@/services/mockAuthService';

export const ChangePasswordForm: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Новый пароль должен содержать минимум 8 символов' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await changeUserPassword(user.id, oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Пароль успешно изменён' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Ошибка при смене пароля' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <h3>Смена пароля</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Текущий пароль</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Новый пароль</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="form-group">
          <label>Подтверждение пароля</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сменить пароль'}
        </button>
      </form>
    </div>
  );
};