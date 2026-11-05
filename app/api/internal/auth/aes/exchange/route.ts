import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../../_lib/edgeClient';
import { refreshCookieOptions } from '../../_lib/refreshCookie';
import { AES_DEVICE_COOKIE, aesDeviceCookieOptions } from '../_lib/deviceCookie';

/**
 * Step 1 of an AES sign-in: trades the single-use ticket from the callback for either
 *  - an emailed link (an AES result is only a claim, and the link is what signs the person in), or
 *  - a session straight away, when this browser already proved the account's mailbox before and
 *    holds the secret cookie the backend remembers it by.
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

    const cookieStore = await cookies();
    const deviceToken = cookieStore.get(AES_DEVICE_COOKIE)?.value;

    const response = await fetch(`${API_V1_BASE_URL}/auth/aes/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...edgeClientHeaders(request) },
      body: JSON.stringify({ ticket, deviceToken }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    if (data.signedIn && data.session) {
      const { accessToken, refreshToken, user } = data.session;
      if (refreshToken) cookieStore.set('refreshToken', refreshToken, refreshCookieOptions(request));
      if (data.deviceToken) cookieStore.set(AES_DEVICE_COOKIE, data.deviceToken, aesDeviceCookieOptions(request));
      return NextResponse.json({ signedIn: true, accessToken, user });
    }

    return NextResponse.json({ signedIn: false, challenge: data.challenge });
  } catch (error) {
    console.error('AES exchange error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
