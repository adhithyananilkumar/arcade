/**
 * Who is really signing in, for the backend's session list.
 *
 * These routes call the backend from Vercel's servers, and the backend's proxy (Caddy) discards
 * forwarding headers it doesn't trust — so every session used to be recorded against a Vercel/AWS
 * address ("Device (44.223.42.118)"). Here we pass the browser's own IP, user agent and Vercel's
 * approximate location in dedicated headers, with a shared secret that tells the backend this
 * request came from us. Without EDGE_PROXY_SECRET the backend ignores them and keeps the old
 * behaviour, so nothing breaks before the secret is configured.
 *
 * Server-only: EDGE_PROXY_SECRET must never be exposed to the browser (no NEXT_PUBLIC_ prefix).
 */
export function edgeClientHeaders(request: Request): Record<string, string> {
  const h = request.headers;
  const ip = h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const userAgent = h.get('user-agent') || '';

  const headers: Record<string, string> = {
    // Kept for older backends, which only read these two.
    'X-Forwarded-For': h.get('x-forwarded-for') || '',
    'User-Agent': userAgent,
  };

  const secret = process.env.EDGE_PROXY_SECRET;
  if (!secret) return headers;

  headers['X-Arcade-Edge-Secret'] = secret;
  if (ip) headers['X-Arcade-Client-Ip'] = ip;
  if (userAgent) headers['X-Arcade-Client-UA'] = userAgent;
  const location = locationOf(h);
  // Encoded: header values must be ASCII, and city names often are not.
  if (location) headers['X-Arcade-Client-Location'] = encodeURIComponent(location);
  return headers;
}

/** "Kochi, KL, IN" from Vercel's geo headers; empty off Vercel (local dev). */
function locationOf(h: Headers): string {
  const decode = (v: string | null) => {
    if (!v) return '';
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  return [decode(h.get('x-vercel-ip-city')), h.get('x-vercel-ip-country-region'), h.get('x-vercel-ip-country')]
    .filter((part): part is string => !!part && part.trim() !== '')
    .join(', ');
}
