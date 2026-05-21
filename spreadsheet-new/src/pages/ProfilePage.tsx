import React from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { UserStats } from '@/components/profile/UserStats';
import '@/styles/profile.css';

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page">
      <h1>Профиль пользователя</h1>
      <div className="profile-container">
        <ProfileForm />
        <ChangePasswordForm />
        <UserStats />
      </div>
    </div>
  );
};

export default ProfilePage;