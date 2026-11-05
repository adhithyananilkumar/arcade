import { refreshCookieOptions } from '../../_lib/refreshCookie';

/**
 * The secret that marks this browser as having already proved, through the emailed AES link, that
 * its owner controls the account's mailbox. It is what lets the next AES sign-in here skip the
 * email — and since an AES result alone is forgeable, it must stay HttpOnly and never reach the
 * page's JavaScript.
 */
export const AES_DEVICE_COOKIE = 'aes_device';

/** Remembered for 90 days, matching the backend's expiry (it is rotated on every use). */
export function aesDeviceCookieOptions(request: Request) {
  return { ...refreshCookieOptions(request), maxAge: 90 * 24 * 60 * 60 };
}
