import { redirect } from 'next/navigation';

/** Superseded by Settings → Security & sign-in, which has the working version of this page. */
export default function Page() {
  redirect('/settings/security');
}
