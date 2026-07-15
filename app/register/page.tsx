import AuthForm from '@/components/auth/AuthForm';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <Suspense fallback={<div className="text-gray-500 font-medium">Loading signup form...</div>}>
        <AuthForm initialMode="signup" />
      </Suspense>
    </div>
  );
}
