import { NextResponse } from 'next/server';

/**
 * The callback AES has registered for this site: after a successful AES login its script submits
 * a form here. The handling is the same as the internal callback route, so it just re-exports it.
 */
export { POST } from '../api/internal/auth/aes/callback/route';

/** Opening /dologin directly (no AES result to process) is not a page — send people to sign in. */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/sign', request.url), 303);
}
