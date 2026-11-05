import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../../_lib/edgeClient';
import { refreshCookieOptions } from '../../_lib/refreshCookie';

/**
 * Step 2 of an AES sign-in: the emailed link opens the session. Trades it server-to-server for
 * tokens and sets the refresh cookie on this host (the backend can't — it lives on a different
 * host). Mirrors oauth/exchange for Google.
 */
export async function POST(request: Request) {
  try {
    if (request.headers.get('x-requested-with') !== 'XMLHttpRequest') {
      return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
    }

    const { challengeId, token } = await request.json();
    if (typeof challengeId !== 'string' || typeof token !== 'string') {
      return NextResponse.json({ message: 'Open the link we emailed you' }, { status: 400 });
    }

    const response = await fetch(`${API_V1_BASE_URL}/auth/aes/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...edgeClientHeaders(request) },
      body: JSON.stringify({ challengeId, token }),
    });

    const data = await response.json().catch(() => ({}));
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
    console.error('AES confirm error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
