import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_V1_BASE_URL } from '@/infrastructure/config/env';
import { edgeClientHeaders } from '../../_lib/edgeClient';

/**
 * Where AES lands after a successful login: its script submits a hidden form to this URL (the
 * callback registered with AES) with the fields of its response. They are plain browser form
 * fields — anyone can post anything here — so nothing is trusted until the backend verifies them,
 * and all that comes back is a single-use ticket. The browser is then sent on to redeem it:
 * `/aes/complete` to sign in, or Settings → Security to link the signed-in account.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const intent = cookieStore.get('arcade_aes_intent')?.value === 'link' ? 'link' : 'login';
  cookieStore.delete('arcade_aes_intent');

  const back = (error: string) => {
    const target = intent === 'link' ? '/settings/security' : '/sign';
    const url = new URL(target, request.url);
    url.searchParams.set('aes_error', error);
    // 303: the browser must turn this POST into a GET of the destination.
    return NextResponse.redirect(url, 303);
  };

  try {
    const form = await request.formData();
    const fields: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === 'string') fields[key] = value;
    });

    const response = await fetch(`${API_V1_BASE_URL}/auth/aes/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...edgeClientHeaders(request) },
      body: JSON.stringify(fields),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data?.ticket !== 'string') {
      // Field NAMES only, never values: enough to see what AES sends while the backend
      // verification is being finished, without logging anyone's identity.
      console.warn('AES callback refused. Fields received:', Object.keys(fields).join(', '));
      return back(data?.message || 'AES sign-in could not be completed.');
    }

    const target = intent === 'link' ? '/settings/security' : '/aes/complete';
    const url = new URL(target, request.url);
    url.searchParams.set('aes_ticket', data.ticket);
    return NextResponse.redirect(url, 303);
  } catch (error) {
    console.error('AES callback error:', error);
    return back('AES sign-in could not be completed.');
  }
}
