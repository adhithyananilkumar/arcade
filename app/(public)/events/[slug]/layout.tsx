import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { API_ORIGIN } from '@/infrastructure/config/env';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

const BASE_METADATA: Metadata = {
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/events/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(String(res.status));
    const event = (await res.json()) as { title?: string; description?: string };
    return {
      ...BASE_METADATA,
      title: event.title ? `${event.title} — Arcade` : 'Event — Arcade',
      description:
        event.description?.trim() ||
        'An event on Arcade, the learning and development platform for practitioners.',
    };
  } catch {
    return {
      ...BASE_METADATA,
      title: 'Event — Arcade',
      description: 'An event on Arcade, the learning and development platform for practitioners.',
    };
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
};

export default function EventDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${inter.variable} ${fraunces.variable} antialiased min-h-screen bg-white text-ink`}
      style={{ fontFamily: 'var(--font-inter), sans-serif' }}
    >
      {children}
    </div>
  );
}
