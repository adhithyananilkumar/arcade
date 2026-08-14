import { redirect } from 'next/navigation';

export default function ForgotPasswordRedirect() {
  redirect('/sign?mode=forgot');
}
