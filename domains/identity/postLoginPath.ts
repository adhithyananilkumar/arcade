/**
 * Where to send a user the moment a sign-in succeeds.
 *
 * Landing on "/" first is wrong for someone who has not finished onboarding: "/" is the public
 * landing page (intro, hero, footer), and ProtectedLayout only bounces them on to /onboarding
 * after that page has already rendered -- which reads as the landing page "reloading" between
 * the password and onboarding. Decide the destination up front instead.
 *
 * `requested` is a caller-supplied return path (?redirect / ?returnTo / ?callbackUrl). It is
 * only honoured when it is a same-origin absolute path: "//evil.com" and "/" + backslash + "evil.com" are
 * protocol-relative URLs that browsers resolve off-site, so a bare startsWith('/') is not enough.
 */
export function postLoginPath(
  user: { onboardingCompleted?: boolean },
  requested?: string | null,
): string {
  if (user.onboardingCompleted === false) return '/onboarding';
  if (requested && requested.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/' + String.fromCharCode(92))) {
    return requested;
  }
  return '/';
}
