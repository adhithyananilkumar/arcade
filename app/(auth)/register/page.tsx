import AuthForm from '@/components/auth/AuthForm';

export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <AuthForm initialMode="signup" />
    </div>
  );
}
