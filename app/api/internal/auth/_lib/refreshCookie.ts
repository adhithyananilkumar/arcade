/**
 * Options for the httpOnly `refreshToken` session cookie set by the login and refresh BFF routes.
 *
 * `secure` follows the protocol the browser actually used, not NODE_ENV. Browsers silently drop a
 * `Secure` cookie set over plain http (localhost is the only exemption), so tying it to
 * NODE_ENV === 'production' meant a production build reached over http://<lan-ip>:3000 logged in
 * "successfully" but never kept the cookie: middleware kept serving the public landing page at "/"
 * and every reload bounced the user back to signed-out. Behind a TLS-terminating proxy the request
 * itself is http, so the proxy's x-forwarded-proto wins when present.
 */
export function refreshCookieOptions(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProto ? `${forwardedProto}:` : new URL(request.url).protocol;

  return {
    httpOnly: true,
    secure: protocol === 'https:',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}
