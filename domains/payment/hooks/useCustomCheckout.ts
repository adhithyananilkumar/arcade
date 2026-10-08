'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  openGatewaySession,
  PaymentDeclined,
  type GatewaySession,
  type PaymentMethodDetails,
  type PaymentRequest,
} from '@/infrastructure/payments/razorpay';
import { ApiError } from '@/infrastructure/http/api';
import { PaymentService } from '../api/payment.service';
import { awaitGrant, PAID_STATUSES, settledOutcome, verifyUntilSettled, type Settled } from '../utils/checkoutFlow';
import { digitsOnly, parseExpiry } from '../utils/card';
import type { LaunchCheckoutCallbacks } from '../utils/launchRazorpayCheckout';
import type {
  AvailableMethods,
  CardInput,
  CheckoutPhase,
  CheckoutSummary,
  QrState,
} from '../components/checkout/checkout.types';

/** How often an open QR or a pending UPI request is checked with the server. */
const POLL_MS = 5000;
/** How long the success mark plays before the modal hands over. */
const SUCCESS_HOLD_MS = 1700;

export interface UseCustomCheckoutOptions {
  enrollmentId: string;
  idempotencyKey: string;
  payerEmail: string;
  payerPhone?: string;
  callbacks: LaunchCheckoutCallbacks;
  /** The modal has finished; unmount it. */
  onClosed: () => void;
  /** Hand over to Razorpay's hosted checkout instead. */
  onUseHosted: () => void;
}

function describe(err: unknown, fallback: string): string {
  if (err instanceof ApiError || err instanceof Error) return err.message || fallback;
  return fallback;
}

/**
 * One session of Arcade's own checkout: opens (or reuses) the server's order, loads the gateway SDK,
 * keeps the refreshable QR, starts payments, and settles on the server's word alone. Reports
 * through the same callbacks as the hosted checkout, so the caller treats both alike.
 */
export function useCustomCheckout({
  enrollmentId,
  idempotencyKey,
  payerEmail,
  payerPhone,
  callbacks,
  onClosed,
  onUseHosted,
}: UseCustomCheckoutOptions) {
  const [phase, setPhase] = useState<CheckoutPhase>({ kind: 'loading' });
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [methods, setMethods] = useState<AvailableMethods | null>(null);
  const [qr, setQr] = useState<QrState>({ status: 'idle' });
  const [phone, setPhone] = useState(() => digitsOnly(payerPhone ?? '').slice(-10));

  const session = useRef<GatewaySession | null>(null);
  const gatewayOrderId = useRef<string>('');
  const finished = useRef(false);
  const callbacksRef = useRef(callbacks);
  const phaseRef = useRef(phase);
  useEffect(() => {
    callbacksRef.current = callbacks;
    phaseRef.current = phase;
  });

  // ── Settling ──────────────────────────────────────────────────────────

  // The modal animates out before anything is announced: a "you're enrolled" toast or a button
  // flipping to "Go to course" must never appear on top of the closing checkout.
  const [open, setOpen] = useState(true);
  const [closedFully] = useState(() => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    return { promise, resolve };
  });
  /** Base UI calls this once the closing animation has finished. */
  const onExited = closedFully.resolve;

  /**
   * Closes the modal now; reports the outcome once the modal is fully gone and the outcome is
   * known (it may still be a server check in flight), then unmounts.
   */
  const leave = useCallback(
    (outcome: (() => void) | Promise<() => void>) => {
      if (finished.current) return;
      finished.current = true;
      setOpen(false);
      void Promise.all([closedFully.promise, Promise.resolve(outcome)]).then(([, report]) => {
        report();
        onClosed();
      });
    },
    [closedFully, onClosed],
  );

  const grant = useCallback(async () => {
    if (finished.current) return;
    setPhase({ kind: 'granted' });
    await Promise.all([awaitGrant(enrollmentId), new Promise((r) => setTimeout(r, SUCCESS_HOLD_MS))]);
    leave(() => callbacksRef.current.onGranted());
  }, [enrollmentId, leave]);

  const applyOutcome = useCallback(
    (outcome: Settled | null) => {
      if (outcome === 'PAID') void grant();
      else if (outcome === 'EXPIRED') setPhase({ kind: 'expired' });
      else if (outcome === 'FAILED') setPhase({ kind: 'error', message: 'This checkout was closed by the server. Nothing was charged.' });
      else if (outcome === 'TIMEOUT') setPhase({ kind: 'slow' });
    },
    [grant],
  );

  /** One quiet server check; true when it settled the checkout. */
  const checkOnce = useCallback(async (): Promise<boolean> => {
    if (!summary || finished.current) return false;
    try {
      const outcome = settledOutcome(await PaymentService.verifyOrder(summary.orderId));
      if (outcome) {
        applyOutcome(outcome);
        return true;
      }
    } catch {
      // A blip; the next tick or the server's own sweeper will catch it.
    }
    return false;
  }, [summary, applyOutcome]);

  // ── Opening ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let checkout;
      try {
        checkout = await PaymentService.checkout(enrollmentId, idempotencyKey);
      } catch (err) {
        if (!cancelled) setPhase({ kind: 'error', message: describe(err, 'Could not start checkout. Please try again.') });
        return;
      }
      if (cancelled) return;
      setSummary({
        orderId: checkout.orderId,
        amount: checkout.amount,
        currency: checkout.currency,
        title: checkout.resourceTitle || 'Enrollment',
        expiresAt: checkout.expiresAt,
      });
      if (PAID_STATUSES.includes(checkout.status)) {
        void grant();
        return;
      }
      const keyId = checkout.gatewayClientFields?.keyId;
      if (!checkout.gatewayOrderId || typeof keyId !== 'string') {
        setPhase({ kind: 'error', message: 'Checkout could not be opened. Nothing was charged — please try again.' });
        return;
      }
      gatewayOrderId.current = checkout.gatewayOrderId;
      setPhase({ kind: 'ready' });

      const opened = await openGatewaySession(keyId);
      if (cancelled) return;
      session.current = opened;
      setMethods(
        opened
          ? {
              card: opened.methods.card,
              banks: opened.methods.netbanking,
              wallets: opened.methods.wallets,
            }
          : { card: false, banks: {}, wallets: [] },
      );
    })();
    return () => {
      cancelled = true;
    };
    // Opened once per mounted session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── The refreshable QR ────────────────────────────────────────────────

  const loadQr = useCallback(async () => {
    if (!summary) return;
    setQr({ status: 'loading' });
    try {
      setQr({ status: 'ready', qr: await PaymentService.qrCode(summary.orderId) });
    } catch (err) {
      setQr({ status: 'error', message: describe(err, 'Could not load a QR code. Try another method.') });
    }
  }, [summary]);

  // The QR lapses on its own clock; flip it so the pane can offer a fresh one.
  useEffect(() => {
    if (qr.status !== 'ready') return;
    const ms = new Date(qr.qr.expiresAt).getTime() - Date.now();
    const timer = setTimeout(() => {
      setQr((current) => (current.status === 'ready' ? { status: 'lapsed', qr: current.qr } : current));
      // A payment made in the last seconds is still honoured — look once more.
      void checkOnce();
    }, Math.max(0, ms));
    return () => clearTimeout(timer);
  }, [qr, checkOnce]);

  // While a QR is scannable or any payment is in flight (bank window, UPI request), keep asking the
  // server — a bank window that is closed without the SDK noticing must not leave us spinning.
  const watching = (phase.kind === 'ready' && qr.status === 'ready') || phase.kind === 'paying';
  useEffect(() => {
    if (!watching) return;
    const tick = setInterval(() => void checkOnce(), POLL_MS);
    return () => clearInterval(tick);
  }, [watching, checkOnce]);

  // The checkout window itself: when it passes, ask once, then call it. Applies mid-payment too, so
  // nothing here can wait past the server's own deadline.
  useEffect(() => {
    if (!summary?.expiresAt || (phase.kind !== 'ready' && phase.kind !== 'paying')) return;
    const ms = new Date(summary.expiresAt).getTime() - Date.now();
    const timer = setTimeout(async () => {
      if (!(await checkOnce())) setPhase({ kind: 'expired' });
    }, Math.max(0, ms));
    return () => clearTimeout(timer);
  }, [summary, phase.kind, checkOnce]);

  // ── Paying ────────────────────────────────────────────────────────────

  const phoneValid = phone.length === 10;

  /**
   * Starts a gateway payment. Must stay synchronous up to `session.pay()` — the bank window it may
   * open is only allowed as a direct result of the click.
   */
  const start = useCallback(
    (details: PaymentMethodDetails) => {
      const gateway = session.current;
      if (!gateway || !summary || finished.current) return;
      const request: PaymentRequest = {
        amount: summary.amount,
        currency: summary.currency,
        orderId: gatewayOrderId.current,
        email: payerEmail,
        contact: `+91${phone}`,
        notes: { internal_order_id: summary.orderId },
        ...details,
      };
      const paying = gateway.pay(request);
      setPhase({ kind: 'paying', method: details.method });

      paying.then(
        async () => {
          if (finished.current) return;
          setPhase({ kind: 'verifying' });
          callbacksRef.current.onVerifying();
          applyOutcome(await verifyUntilSettled(summary.orderId, () => finished.current));
        },
        async (err) => {
          if (finished.current) return;
          // The bank window may report an error after money moved; the server is the judge.
          if (await checkOnce()) return;
          const reason = err instanceof PaymentDeclined ? err.description : 'That payment did not go through.';
          setPhase({ kind: 'declined', reason });
        },
      );
    },
    [summary, payerEmail, phone, applyOutcome, checkOnce],
  );

  const payWithBank = useCallback((bank: string) => start({ method: 'netbanking', bank }), [start]);
  const payWithWallet = useCallback((wallet: string) => start({ method: 'wallet', wallet }), [start]);
  const payWithCard = useCallback(
    (card: CardInput) => {
      const expiry = parseExpiry(card.expiry);
      if (!expiry) return;
      start({
        method: 'card',
        card: {
          number: digitsOnly(card.number),
          expiryMonth: expiry.month,
          expiryYear: expiry.year,
          cvv: card.cvv,
          name: card.name.trim(),
        },
      });
    },
    [start],
  );

  const cardNetwork = useCallback((number: string) => session.current?.cardNetwork(number) ?? '', []);

  // ── Leaving ───────────────────────────────────────────────────────────

  const backToMethods = useCallback(() => setPhase({ kind: 'ready' }), []);

  const close = useCallback(() => {
    const current = phaseRef.current;
    if (finished.current) return;
    if (current.kind === 'granted') return; // already handing over
    if (current.kind === 'expired') return leave(() => callbacksRef.current.onExpired());
    if (current.kind === 'slow') return leave(() => callbacksRef.current.onVerifyTimeout());
    const cb = callbacksRef.current;
    if (current.kind === 'verifying' && summary) {
      // Money may have moved: the modal closes now, confirming carries on out of sight, and the
      // result is announced once it is known.
      return leave(
        verifyUntilSettled(summary.orderId, () => false).then(async (outcome) => {
          if (outcome === 'PAID') {
            await awaitGrant(enrollmentId);
            return cb.onGranted;
          }
          if (outcome === 'EXPIRED') return cb.onExpired;
          if (outcome === 'FAILED') return cb.onFailed;
          return cb.onVerifyTimeout;
        }),
      );
    }
    // A UPI approval can land moments after the window closes. Check once, quietly.
    leave(
      (async () => {
        if (!summary) return cb.onDismissed;
        try {
          const outcome = settledOutcome(await PaymentService.verifyOrder(summary.orderId));
          if (outcome === 'PAID') {
            await awaitGrant(enrollmentId);
            return cb.onGranted;
          }
          if (outcome === 'EXPIRED') return cb.onExpired;
        } catch {
          // An ordinary dismissal; the sweeper still reconciles server-side.
        }
        return cb.onDismissed;
      })(),
    );
  }, [summary, enrollmentId, leave]);

  /** Razorpay's own checkout opens only once ours has fully closed. */
  const switchToHosted = useCallback(() => leave(() => onUseHosted()), [leave, onUseHosted]);

  return {
    open,
    onExited,
    phase,
    summary,
    methods,
    qr,
    phone,
    phoneValid,
    setPhone: (value: string) => setPhone(digitsOnly(value).slice(0, 10)),
    loadQr,
    payWithCard,
    payWithBank,
    payWithWallet,
    cardNetwork,
    backToMethods,
    close,
    switchToHosted,
  };
}
