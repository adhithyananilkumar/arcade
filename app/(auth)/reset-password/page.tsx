import { redirect } from 'next/navigation';

export default async function ResetPasswordRedirect({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) {
    redirect(`/sign?mode=reset&token=${encodeURIComponent(token)}`);
  }
  redirect('/sign?mode=reset');
}
