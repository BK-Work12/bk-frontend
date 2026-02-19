import { NewSignUpIndex } from '@/components/auth/newSignup';
import React, { Suspense } from 'react';

const RegisterPage = () => {
  return (
    <div>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#111111]" />}>
        <NewSignUpIndex />
      </Suspense>
    </div>
  );
};

export default RegisterPage;
