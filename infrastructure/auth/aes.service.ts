import { api } from '@/infrastructure/http/api';
import { AES_LOGIN_KEY } from '@/infrastructure/config/env';

/** What Settings → Security shows for the linked AES (AJCE portal) profile. */
export interface AesLinkStatus {
  enabled: boolean;
  linked: boolean;
  aesEmail?: string | null;
  name?: string | null;
  kind?: 'STUDENT' | 'STAFF' | 'UNKNOWN' | null;
  admissionNo?: string | null;
  linkedAt?: string | null;
  /** False when AES is the only way in — the user must set a password first. */
  canUnlink: boolean;
}

export type AesIntent = 'login' | 'link';

const JQUERY_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js';
const AES_SCRIPT_URL = `https://login.aesajce.in/aes-login.js?api=${AES_LOGIN_KEY}`;
/** Set by the page before the AES popup opens; the BFF callback reads it to know what to do. */
const INTENT_COOKIE = 'arcade_aes_intent';

let scriptPromise: Promise<void> | null = null;

function loadScript(src: string, module = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    if (module) {
      el.type = 'module';
      // The AES server only serves the script to the host registered for our key, and tells hosts
      // apart by the Referer — so always send our origin.
      el.referrerPolicy = 'origin';
    }
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(el);
  });
}

async function readError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data?.message ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

/**
 * AES sign-in and linking. The login popup itself is AES's script (it needs jQuery): once loaded,
 * any element with the `aes-dologin` class opens it, and on success AES posts the result to our
 * BFF callback (app/api/internal/auth/aes/callback), which verifies it with the backend.
 */
export class AesService {
  static get available(): boolean {
    return AES_LOGIN_KEY !== '';
  }

  /** Loads jQuery and the AES script once per page load. Safe to call repeatedly. */
  static loadScript(): Promise<void> {
    if (!AesService.available || typeof window === 'undefined') return Promise.resolve();
    if (!scriptPromise) {
      scriptPromise = (async () => {
        if (!(window as unknown as { $?: unknown }).$) await loadScript(JQUERY_URL);
        await loadScript(AES_SCRIPT_URL, true);
      })().catch((err) => {
        scriptPromise = null; // let the next click retry
        throw err;
      });
    }
    return scriptPromise;
  }

  /** Tells the callback whether the coming AES result signs in or links to the current account. */
  static setIntent(intent: AesIntent) {
    document.cookie = `${INTENT_COOKIE}=${intent}; path=/; max-age=600; SameSite=Lax`;
  }

  /** Finishes an AES sign-in: trades the ticket for a session (cookie set by the BFF route). */
  static async exchange(ticket: string) {
    const res = await fetch('/api/internal/auth/aes/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
      body: JSON.stringify({ ticket }),
    });
    if (!res.ok) throw await readError(res, 'AES sign-in failed');
    return res.json();
  }

  static async status(): Promise<AesLinkStatus> {
    return api.get<AesLinkStatus>('/api/v1/users/me/aes');
  }

  static async link(ticket: string): Promise<AesLinkStatus> {
    return api.post<AesLinkStatus>('/api/v1/users/me/aes/link', { ticket });
  }

  static async unlink(): Promise<void> {
    await api.delete('/api/v1/users/me/aes');
  }
}
