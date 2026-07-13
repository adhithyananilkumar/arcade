import AuthForm from '@/components/auth/AuthForm';

<<<<<<< HEAD
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm initialMode="signup" />
      </Suspense>
=======
export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <AuthForm initialMode="signup" />
>>>>>>> 13f320990e05a198aced4b03c2df8b878627f83e
    </div>
  );
}
