import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { refreshCookieOptions } from '../../_lib/refreshCookie';

/**
 * Finishes a Google sign-in. The backend's OAuth success handler redirects to /oauth2/redirect
 * with a single-use, 60-second code; this route trades it server-to-server for tokens and sets the
 * refresh cookie on this host — the backend can't, because it lives on a different host.
 */
export async function POST(request: Request) {
  try {
    if (request.headers.get('x-requested-with') !== 'XMLHttpRequest') {
      return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
    }

    const { code } = await request.json();
    if (typeof code !== 'string' || !code) {
      return NextResponse.json({ message: 'Code is required' }, { status: 400 });
    }

    const response = await fetch(`${API_V1_BASE_URL}/auth/oauth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const { accessToken, refreshToken, user } = data;
    if (refreshToken) {
      const cookieStore = await cookies();
      cookieStore.set('refreshToken', refreshToken, refreshCookieOptions(request));
    }

    return NextResponse.json({ accessToken, user });
  } catch (error) {
    console.error('OAuth exchange error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
