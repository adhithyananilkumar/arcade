import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { API_ORIGIN } from '@/infrastructure/config/env'
import ViewerShell from '@/apps/public/layout/ViewerShell'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-fraunces',
    display: 'swap',
    axes: ['opsz', 'SOFT'],
})

const BASE_METADATA: Metadata = {
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
}

/**
 * Title and description come from the course itself. They were previously fixed strings
 * describing one specific design course, so every course on the platform shared that title in
 * the browser tab, in search results and in any link preview.
 *
 * Best-effort: this runs server-side at request time and the page renders fine without it, so a
 * failed or slow lookup falls back to a neutral title rather than blocking the route.
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    try {
        const res = await fetch(`${API_ORIGIN}/api/v1/public/courses/${id}`, {
            // Course metadata changes rarely; revalidate rather than hit the backend per request.
            next: { revalidate: 300 },
        })
        if (!res.ok) throw new Error(String(res.status))
        const course = (await res.json()) as { title?: string; description?: string }
        return {
            ...BASE_METADATA,
            title: course.title ? `${course.title} — Arcade` : 'Course — Arcade',
            description:
                course.description?.trim() ||
                'A course on Arcade, the learning platform for practitioners.',
        }
    } catch {
        return {
            ...BASE_METADATA,
            title: 'Course — Arcade',
            description: 'A course on Arcade, the learning platform for practitioners.',
        }
    }
}



export default function CourseLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    // A course page is reached from inside the app as often as from outside it, so the chrome
    // follows the viewer: `LearnerShell` for a signed-in learner, the marketing nav and footer for
    // a visitor. This page used to live under `(authenticated)`, where it simply inherited the
    // signed-in shell; moving it into `(public)` handed every learner the public site's header —
    // with its sign-up call to action — in place of their own navigation.
    return (
        <div className={`${inter.variable} ${fraunces.variable} bg-paper antialiased min-h-screen`} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            <ViewerShell>{children}</ViewerShell>
            {process.env.NODE_ENV === 'production' && <Analytics />}
        </div>
    )
}
