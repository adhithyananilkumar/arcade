'use client';

// TEMPORARY visual harness for the checkout modal — delete before committing.
import { useState } from 'react';
import { CheckoutModal } from '@/domains/payment/components/checkout/CheckoutModal';
import type { CheckoutPhase } from '@/domains/payment/components/checkout/checkout.types';

const PHASES: CheckoutPhase[] = [
  { kind: 'ready' },
  { kind: 'paying', method: 'card' },
  { kind: 'paying', method: 'upi' },
  { kind: 'verifying' },
  { kind: 'granted' },
  { kind: 'declined', reason: 'Your bank declined the transaction' },
  { kind: 'expired' },
];

export default function CheckoutPreview() {
  const [phase, setPhase] = useState<CheckoutPhase>({ kind: 'ready' });
  const [phone, setPhone] = useState('9876521543');
  const [expiresAt] = useState(() => new Date(Date.now() + 25 * 60_000).toISOString());
  const [qrExpires] = useState(() => new Date(Date.now() + 200_000).toISOString());
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#c9e8d8,#9cc4b4)] p-4">
      <div id="phase-switcher" className="fixed left-2 top-2 z-[200] flex flex-wrap gap-1">
        {PHASES.map((p, i) => (
          <button
            key={i}
            data-phase={p.kind + ('method' in p ? `-${p.method}` : '')}
            onClick={() => setPhase(p)}
            className="rounded bg-black/70 px-2 py-1 text-[11px] text-white"
          >
            {p.kind}
            {'method' in p ? `:${p.method}` : ''}
          </button>
        ))}
      </div>
      <CheckoutModal
        phase={phase}
        summary={{ orderId: 'o1', amount: 200, currency: 'INR', title: 'Adv. CSS', expiresAt }}
        methods={{
          card: true,
          upiId: true,
          banks: { HDFC: 'HDFC Bank', SBIN: 'State Bank of India', ICIC: 'ICICI Bank', UTIB: 'Axis Bank' },
          wallets: ['airtelmoney', 'mobikwik', 'olamoney', 'payzapp'],
        }}
        qr={{ status: 'ready', qr: { qrCodeId: 'qr_1', imageUrl: '', expiresAt: qrExpires, amount: 200, upiPayload: 'upi://pay?pa=arcade@razorpay&pn=Arcade&am=2.00&cu=INR&tr=qr_1' } }}
        payerEmail="superuser@example.com"
        phone={phone}
        phoneValid={phone.length === 10}
        onPhoneChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
        onLoadQr={() => {}}
        onVerifyVpa={async () => true}
        onPayWithVpa={() => setPhase({ kind: 'paying', method: 'upi' })}
        onPayWithCard={() => setPhase({ kind: 'paying', method: 'card' })}
        onPayWithBank={() => setPhase({ kind: 'paying', method: 'netbanking' })}
        onPayWithWallet={() => setPhase({ kind: 'paying', method: 'wallet' })}
        cardNetwork={() => ''}
        onRetry={() => setPhase({ kind: 'ready' })}
        onClose={() => setPhase({ kind: 'ready' })}
        onUseHosted={() => {}}
      />
    </div>
  );
}
