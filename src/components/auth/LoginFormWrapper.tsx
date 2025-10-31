'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

interface LoginFormProps {
  onTOTPRequired?: (sessionId: string) => void;
}

function LoginFormWithSearchParams({ onTOTPRequired }: LoginFormProps) {
  return <LoginForm onTOTPRequired={onTOTPRequired} />;
}

export default function LoginFormWrapper({ onTOTPRequired }: LoginFormProps) {
  return (
    <Suspense fallback={<div className="text-center text-support">Loading...</div>}>
      <LoginFormWithSearchParams onTOTPRequired={onTOTPRequired} />
    </Suspense>
  );
}