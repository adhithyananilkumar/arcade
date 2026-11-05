import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../../_lib/edgeClient';
import { refreshCookieOptions } from '../../_lib/refreshCookie';
import { AES_DEVICE_COOKIE, aesDeviceCookieOptions } from '../_lib/deviceCookie';

/**
 * Step 2 of an AES sign-in: the emailed link opens the session. Trades it server-to-server for
 * tokens and sets the refresh cookie on this host (the backend can't — it lives on a different
 * host), and remembers this browser so the next AES sign-in here needs no email.
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

    const { accessToken, refreshToken, user } = data.session ?? {};
    const cookieStore = await cookies();
    if (refreshToken) cookieStore.set('refreshToken', refreshToken, refreshCookieOptions(request));
    if (data.deviceToken) cookieStore.set(AES_DEVICE_COOKIE, data.deviceToken, aesDeviceCookieOptions(request));

    return NextResponse.json({ accessToken, user });
  } catch (error) {
    console.error('AES confirm error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
