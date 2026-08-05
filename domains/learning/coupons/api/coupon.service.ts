/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains / Learning / Coupons
 * ------------------------------------------------------------------
 */

import { api } from '@/infrastructure/http/api';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export type RedeemStatus =
  | 'valid'
  | 'expired'
  | 'used'
  | 'invalid'
  | 'redeemed'
  | 'already_used';

export interface DiscountPayload {
  type: 'PERCENT' | 'FIXED';
  value: number;
  currency: string;
  couponCode: string;
  couponName: string;
  description?: string | null;
  discountApplied: number;
}

export interface RedeemSessionResponse {
  status: RedeemStatus;
  redemptionCode?: string | null;
  expiresAt?: string | null;
  discount?: DiscountPayload | null;
}

export interface CouponTemplateDto {
  id: string;
  name: string;
  originalFilename: string;
  contentType: string;
  fileUrl: string;
  createdAt: string;
}

export interface UserCouponDto {
  id: string;
  couponId: string;
  couponCode: string;
  couponName: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  currency: string;
  ownerUserId: string;
  originalRecipientId: string;
  qrToken: string;
  qrImageUrl: string | null;
  status: 'ISSUED' | 'REDEEMED' | 'EXPIRED';
  canTransfer: boolean;
  createdAt: string;
  redeemedAt: string | null;
  expiresAt?: string | null;
  templateFileUrl?: string | null;
}

export interface CouponDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  currency: string;
  workshopId: string | null;
  templateId: string | null;
  templateName: string | null;
  templateFileUrl: string | null;
  templateContentType: string | null;
  expiresAt: string | null;
  active: boolean;
}

export interface CreateCouponPayload {
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  currency?: string;
  workshopId?: string | null;
  templateId: string;
  expiresAt: string;
}

export interface GenerateQrResponse {
  qrImageUrl: string;
  scanUrl: string;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export class CouponService {
  static async listAll(): Promise<CouponDto[]> {
    return api.get<CouponDto[]>('/api/coupons');
  }

  static async listTemplates(): Promise<CouponTemplateDto[]> {
    return api.get<CouponTemplateDto[]>('/api/coupons/templates');
  }

  static async uploadTemplate(file: File, name?: string): Promise<CouponTemplateDto> {
    const token = useAuthStore.getState().accessToken;
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);

    const res = await fetch(`${BASE_URL}/api/coupons/templates`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      let message = 'Failed to upload template';
      try {
        const err = await res.json();
        message = err.message ?? message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    return res.json();
  }

  static async create(payload: CreateCouponPayload): Promise<CouponDto> {
    return api.post<CouponDto>('/api/coupons', payload);
  }

  static async listIssued(couponId: string): Promise<UserCouponDto[]> {
    return api.get<UserCouponDto[]>(`/api/coupons/${couponId}/issued`);
  }

  static async issue(couponId: string, recipientUserId: string): Promise<UserCouponDto> {
    return api.post<UserCouponDto>('/api/coupons/issue', { couponId, recipientUserId });
  }

  static async generateQr(userCouponId: string): Promise<GenerateQrResponse> {
    return api.post<GenerateQrResponse>(`/api/coupons/${userCouponId}/generate-qr`);
  }

  static async getSession(sessionToken: string): Promise<RedeemSessionResponse> {
    return api.get<RedeemSessionResponse>(`/api/coupon/redeem/${sessionToken}`);
  }

  static async redeemCode(redemptionCode: string): Promise<RedeemSessionResponse> {
    return api.post<RedeemSessionResponse>('/api/coupon/redeem-code', { redemptionCode });
  }

  static async listMine(): Promise<UserCouponDto[]> {
    return api.get<UserCouponDto[]>('/api/coupons/mine');
  }

  static async getUserCoupon(userCouponId: string): Promise<UserCouponDto> {
    return api.get<UserCouponDto>(`/api/coupons/user-coupons/${userCouponId}`);
  }

  /** Download generated coupon QR as PNG. */
  static async downloadQr(userCouponId: string): Promise<void> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/api/coupons/${userCouponId}/qr/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      throw new Error('Failed to download coupon PNG');
    }
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = /filename="?([^"]+)"?/i.exec(disposition);
    downloadBlob(blob, match?.[1] ?? `coupon-${userCouponId}.png`);
  }
}
