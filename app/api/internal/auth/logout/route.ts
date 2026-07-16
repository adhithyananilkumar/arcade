import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function POST(request: Request) {
  try {
    // CSRF Protection
    const requestedWith = request.headers.get('x-requested-with');
    if (requestedWith !== 'XMLHttpRequest') {
      return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
    }

    const authHeader = request.headers.get('authorization');
    
    // Call backend to revoke tokens (best effort)
    if (authHeader) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }).catch(console.error); // Ignore errors during logout
    }

    // Always clear the cookie
    const nextResponse = new NextResponse(null, { status: 204 });
    nextResponse.cookies.delete('refreshToken');

    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
