import { redirect } from 'next/navigation';

export default async function VerifyEmailRedirect({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) {
    redirect(`/sign?mode=verify&token=${encodeURIComponent(token)}`);
  }
  redirect('/sign?mode=verify');
}
