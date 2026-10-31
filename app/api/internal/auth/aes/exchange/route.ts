import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../../_lib/edgeClient';
import { refreshCookieOptions } from '../../_lib/refreshCookie';

/**
 * Finishes an AES sign-in: trades the single-use ticket from the callback for tokens
 * server-to-server and sets the refresh cookie on this host (the backend can't — it lives on a
 * different host). Mirrors oauth/exchange for Google.
 */
export async function POST(request: Request) {
  try {
    if (request.headers.get('x-requested-with') !== 'XMLHttpRequest') {
      return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
    }

    const { ticket } = await request.json();
    if (typeof ticket !== 'string' || !ticket) {
      return NextResponse.json({ message: 'Ticket is required' }, { status: 400 });
    }

    const response = await fetch(`${API_V1_BASE_URL}/auth/aes/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...edgeClientHeaders(request) },
      body: JSON.stringify({ ticket }),
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
    console.error('AES exchange error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
