import { describe, expect, it } from 'vitest';
import { gatewayDescription, gatewayFailureHint, humanizePaymentText } from './paymentText';

const RAW_REFUND_ERROR =
  'Failed to create Razorpay refund: 400 Bad Request: "{"error":{"code":"BAD_REQUEST_ERROR","description":"Your account does not have enough balance to carry out the refund operation. You can add funds to your account from your Razorpay dashboard or capture new payments.","metadata":{},"reason":"NA","source":"NA","step":"NA"}}"';

describe('payment text', () => {
  it('reduces a raw gateway error to its sentence', () => {
    expect(gatewayDescription(RAW_REFUND_ERROR)).toMatch(/^Your account does not have enough balance/);
    expect(humanizePaymentText(RAW_REFUND_ERROR)).toMatch(/^Razorpay declined the refund: Your account does not have/);
  });

  it('formats legacy minor-unit amounts and timestamps', () => {
    const text = humanizePaymentText('200 INR minor units, open until 2026-10-07T08:54:27.660559149Z');
    expect(text).toMatch(/^₹2\.00, open until /);
    expect(text).not.toMatch(/2026-10-07T/);
    expect(humanizePaymentText('100 INR minor units returned')).toBe('₹1.00 sent to the learner’s bank');
    expect(humanizePaymentText('100 INR minor units — you keep it (access revoked)')).toBe('₹1.00 — you keep it (access revoked)');
  });

  it('leaves plain sentences alone', () => {
    expect(humanizePaymentText('Captured via verify (pay_X)')).toBe('Captured via verify (pay_X)');
    expect(humanizePaymentText(null)).toBe('');
  });

  it('suggests a fix for a low Razorpay balance', () => {
    expect(gatewayFailureHint(RAW_REFUND_ERROR)).toMatch(/Add funds/);
    expect(gatewayFailureHint('Card declined')).toBeNull();
  });
});
