/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: Payments
 *
 * Purpose:
 * Adapter over Razorpay's Custom Checkout SDK (razorpay.js) — the gateway API that lets Arcade
 * draw its own payment UI instead of Razorpay's hosted modal.
 *
 * Rules:
 * - Technical only; no domain knowledge (orders, enrollments, statuses live in domains/payment).
 * - Card data goes from the caller straight to Razorpay through this module. Never log it, never
 *   keep it, never send it anywhere else.
 * - `pay()` must be called synchronously from a click handler: 3-D Secure and netbanking open a
 *   bank window, and browsers block windows not opened by a user gesture.
 * ------------------------------------------------------------------
 */

const SDK_SRC = 'https://checkout.razorpay.com/v1/razorpay.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

/** What the account can take, as the SDK reports it once ready. */
export interface GatewayMethods {
  card: boolean;
  upi: boolean;
  /** Bank code → display name. Empty when netbanking is off. */
  netbanking: Record<string, string>;
  /** Wallet codes that are enabled. */
  wallets: string[];
}

export interface PayerContact {
  email: string;
  contact: string;
}

interface Base extends PayerContact {
  amount: number;
  currency: string;
  /** The gateway order this payment belongs to. */
  orderId: string;
  /** Free-form notes attached to the payment (e.g. our internal order id). */
  notes?: Record<string, string>;
}

/** The method-specific part of a payment. */
export type PaymentMethodDetails =
  | { method: 'upi'; vpa: string }
  | {
      method: 'card';
      card: { number: string; expiryMonth: string; expiryYear: string; cvv: string; name: string };
    }
  | { method: 'netbanking'; bank: string }
  | { method: 'wallet'; wallet: string };

export type PaymentRequest = Base & PaymentMethodDetails;

export interface PaymentSucceeded {
  paymentId: string;
}

/** A declined or abandoned attempt. `description` is the gateway's, safe to show. */
export class PaymentDeclined extends Error {
  constructor(
    readonly description: string,
    readonly reason?: string,
  ) {
    super(description);
    this.name = 'PaymentDeclined';
  }
}

/**
 * razorpay.js and Razorpay's hosted checkout.js (the mobile path) both assign `window.Razorpay`,
 * each with a different constructor. Whichever loads second overwrites the global, so this module
 * keeps its own reference, captured the moment its script finishes loading.
 */
let RazorpayJs: any = null;
let sdkPromise: Promise<any> | null = null;

function loadSdk(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (RazorpayJs) return Promise.resolve(RazorpayJs);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => {
      RazorpayJs = window.Razorpay ?? null;
      resolve(RazorpayJs);
    };
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      resolve(null);
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

function normaliseMethods(raw: any): GatewayMethods {
  const wallets = raw?.wallet && typeof raw.wallet === 'object'
    ? Object.keys(raw.wallet).filter((code) => raw.wallet[code])
    : [];
  const netbanking = raw?.netbanking && typeof raw.netbanking === 'object' ? (raw.netbanking as Record<string, string>) : {};
  return {
    card: Boolean(raw?.card),
    upi: Boolean(raw?.upi),
    netbanking,
    wallets,
  };
}

function toSdkPayload(request: PaymentRequest): Record<string, unknown> {
  const base: Record<string, unknown> = {
    amount: request.amount,
    currency: request.currency,
    order_id: request.orderId,
    email: request.email,
    contact: request.contact,
    method: request.method,
    notes: request.notes,
  };
  switch (request.method) {
    case 'upi':
      return { ...base, vpa: request.vpa };
    case 'card':
      return {
        ...base,
        'card[number]': request.card.number,
        'card[expiry_month]': request.card.expiryMonth,
        'card[expiry_year]': request.card.expiryYear,
        'card[cvv]': request.card.cvv,
        'card[name]': request.card.name,
      };
    case 'netbanking':
      return { ...base, bank: request.bank };
    case 'wallet':
      return { ...base, wallet: request.wallet };
  }
}

/**
 * One gateway session for one checkout. Create it when the modal opens (`openGatewaySession`), so
 * the SDK is loaded and ready by the time the learner clicks Pay.
 */
export interface GatewaySession {
  methods: GatewayMethods;
  /** Starts a payment. Call synchronously inside the click handler. */
  pay(request: PaymentRequest): Promise<PaymentSucceeded>;
  /** Whether a UPI ID exists, per the gateway. Resolves false rather than throwing. */
  verifyVpa(vpa: string): Promise<boolean>;
  /** 'visa', 'mastercard', 'rupay', 'amex', … or '' when unknown. */
  cardNetwork(number: string): string;
}

/** Loads the SDK and opens a session; null when the SDK could not load. */
export async function openGatewaySession(keyId: string): Promise<GatewaySession | null> {
  const Sdk = await loadSdk();
  if (!Sdk) return null;

  const sdk = new Sdk({ key: keyId });
  const methods = await new Promise<GatewayMethods>((resolve) => {
    let settled = false;
    const done = (raw: any) => {
      if (settled) return;
      settled = true;
      resolve(normaliseMethods(raw));
    };
    try {
      sdk.once('ready', (response: any) => done(response?.methods));
    } catch {
      done(sdk.methods);
    }
    // Some SDK builds are ready synchronously and never emit; don't hang the modal on it.
    setTimeout(() => done(sdk.methods), 4000);
  });

  return {
    methods,
    pay(request) {
      return new Promise<PaymentSucceeded>((resolve, reject) => {
        sdk.once?.('payment.success', (response: any) => resolve({ paymentId: response?.razorpay_payment_id ?? '' }));
        sdk.once?.('payment.error', (response: any) =>
          reject(
            new PaymentDeclined(
              response?.error?.description || 'That payment did not go through.',
              response?.error?.reason,
            ),
          ),
        );
        try {
          sdk.createPayment(toSdkPayload(request));
        } catch (err) {
          reject(new PaymentDeclined(err instanceof Error ? err.message : 'Could not start the payment.'));
        }
      });
    },
    async verifyVpa(vpa) {
      try {
        await sdk.verifyVpa(vpa);
        return true;
      } catch {
        return false;
      }
    },
    cardNetwork(number) {
      try {
        const network = sdk.getCardNetwork?.(number.replace(/\s+/g, ''));
        return typeof network === 'string' && network !== 'unknown' ? network : '';
      } catch {
        return '';
      }
    },
  };
}
