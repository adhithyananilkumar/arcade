import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <AuthForm initialMode="login" />
    </div>
  );
}
