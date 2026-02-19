import MainLayout from '@/components/layout/mainLayout';
import { ProfilePageIndex } from '@/components/profile';
import React from 'react';

const Profile = () => {
  return (
    <MainLayout>
      <div className="pt-9">
        <ProfilePageIndex />
      </div>
    </MainLayout>
  );
};

export default Profile;
