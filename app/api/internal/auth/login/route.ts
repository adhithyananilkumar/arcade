import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../_lib/edgeClient';
import { refreshCookieOptions } from '../_lib/refreshCookie';

const BACKEND_URL = API_V1_BASE_URL;

export async function GET() {
  return NextResponse.json({ message: 'Login API route active' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...edgeClientHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const { accessToken, refreshToken, user } = data;

    // Set refresh token in HttpOnly cookie using standard Next.js method
    if (refreshToken) {
      const cookieStore = await cookies();
      cookieStore.set('refreshToken', refreshToken, refreshCookieOptions(request));
    }

    // Return access token to the client
    return NextResponse.json({ accessToken, user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
