/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App
 *
 * Purpose:
 * Dev-only index of every page in the app, so the UI team/stakeholders
 * can click through the full app without knowing the route structure or
 * needing real auth (pair with NEXT_PUBLIC_AUTH_BYPASS). 404s outside
 * mock mode, so it ships dormant in production the same way mock/ does.
 * See mock/README.md.
 * ------------------------------------------------------------------
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';

const ROUTE_GROUPS: { label: string; routes: { label: string; href: string }[] }[] = [
  {
    label: 'Public',
    routes: [
      { label: 'Landing', href: '/' },
      { label: 'Explore', href: '/explore' },
      { label: 'Courses', href: '/courses' },
      { label: 'Creators', href: '/creators' },
      { label: 'About', href: '/about' },
      { label: 'Forum', href: '/forum' },
    ],
  },
  {
    label: 'Auth',
    routes: [
      { label: 'Sign in / up', href: '/sign' },
      { label: 'Forgot password', href: '/forgot-password' },
      { label: 'Reset password', href: '/reset-password' },
      { label: 'Verify email', href: '/verify-email' },
    ],
  },
  {
    label: 'Onboarding',
    routes: [{ label: 'Onboarding', href: '/onboarding' }],
  },
  {
    label: 'Authenticated',
    routes: [
      { label: 'Learn', href: '/learn' },
      { label: 'My courses', href: '/my-courses' },
      { label: 'Channels', href: '/channels' },
      { label: 'Manage channels', href: '/manage-channels' },
      { label: 'Studio', href: '/studio' },
      { label: 'Organizations', href: '/organizations' },
      { label: 'Console', href: '/console' },
      { label: 'Settings', href: '/settings' },
      { label: 'Search', href: '/search' },
      { label: 'Trash', href: '/trash' },
      { label: 'Profile', href: '/profile' },
      { label: 'Exam', href: '/exam' },
    ],
  },
  {
    label: 'Workshops',
    routes: [
      { label: 'Workshops preview', href: '/workshops/preview' },
    ],
  },
];

export default function PreviewIndexPage() {
  if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true') {
    notFound();
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Arcade — Preview Index</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Dev-only page list. Visible because NEXT_PUBLIC_USE_MOCKS=true.
      </p>
      {ROUTE_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{group.label}</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '1.25rem' }}>
            {group.routes.map((route) => (
              <li key={route.href}>
                <Link href={route.href} style={{ color: '#4f46e5' }}>
                  {route.label} <span style={{ color: '#999' }}>({route.href})</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
