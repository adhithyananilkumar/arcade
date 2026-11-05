import { NextResponse } from 'next/server';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../../_lib/edgeClient';

/**
 * Step 1 of an AES sign-in: trades the single-use ticket from the callback for an emailed link.
 * No session starts here — an AES result is only a claim, and the emailed link (confirm route) is what
 * signs the person in.
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

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('AES exchange error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
