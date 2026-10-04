import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../_lib/edgeClient';
import { refreshCookieOptions } from '../_lib/refreshCookie';

const BACKEND_URL = API_V1_BASE_URL;

export async function GET() {
  return NextResponse.json({ message: 'Refresh API route active' });
}

export async function POST(request: Request) {
  try {
    // CSRF Protection: Verify X-Requested-With header
    const requestedWith = request.headers.get('x-requested-with');
    if (requestedWith !== 'XMLHttpRequest') {
      return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    console.log('[REFRESH] Incoming refresh request. Has refreshToken cookie?', !!refreshToken);

    if (!refreshToken) {
      console.log('[REFRESH] Failing because no refresh token was found in cookies');
      return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...edgeClientHeaders(request),
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    console.log('[REFRESH] Backend response status:', response.status);

    if (!response.ok) {
      console.log('[REFRESH] Backend rejected refresh. Data:', data);
      // If refresh fails, clear the invalid cookie
      cookieStore.delete('refreshToken');
      return NextResponse.json(data, { status: response.status });
    }

    console.log('[REFRESH] Backend refresh successful. Rotating cookie.');

    // Set new refresh token in HttpOnly cookie (Token Rotation)
    if (data.refreshToken) {
      cookieStore.set('refreshToken', data.refreshToken, refreshCookieOptions(request));
    }

    return NextResponse.json({ accessToken: data.accessToken, user: data.user });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
