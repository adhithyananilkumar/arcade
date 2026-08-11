import { api } from "@/infrastructure/http/api";

export interface QrResponse {
  id: string;
  token: string;
  type: "GENERIC" | "COUPON";
  content: string;
  format: "PNG" | "SVG" | "BASE64";
  sizePx: number;
  createdAt: string;
  expiresAt?: string;
  redeemed: boolean;
  redeemedAt?: string;
  imageBase64?: string;
  couponCode?: string;
  merchantId?: string;
}

export interface QrStatus {
  token: string;
  status: "VALID" | "REDEEMED" | "EXPIRED";
  redeemed: boolean;
  expired: boolean;
  expiresAt?: string;
  couponCode?: string;
}

export interface RedeemResponse {
  token: string;
  status: string;
  couponCode?: string;
  merchantId?: string;
  redeemedAt: string;
  message: string;
}

export const qrService = {
  generateGeneric: (data: {
    content: string;
    format?: string;
    sizePx?: number;
    errorCorrection?: string;
  }) => api.post<QrResponse>("/api/v1/qr/generate", data),

  generateCoupon: (data: {
    couponCode: string;
    expiresAt?: string;
    merchantId?: string;
    sizePx?: number;
    format?: string;
    errorCorrection?: string;
  }) => api.post<QrResponse>("/api/v1/qr/coupon", data),

  getDetails: (token: string) => api.get<QrResponse>(`/api/v1/qr/${token}/details`),

  getStatus: (token: string) => api.get<QrStatus>(`/api/v1/qr/${token}/status`),

  redeem: (token: string) => api.post<RedeemResponse>(`/api/v1/qr/${token}/redeem`, {}),
};
