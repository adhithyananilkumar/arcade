import { api } from "@/infrastructure/http/api";
import type { CouponTheme } from "@/domains/coupons/theme";

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT_AMOUNT";
  discountValue: number;
  merchantId?: string;
  qrToken?: string;
  qrImageUrl?: string;
  batchId?: string;
  expiresAt?: string;
  redeemed: boolean;
  redeemedAt?: string;
  createdAt: string;
  theme?: CouponTheme | null;
  issuedToUserId?: string | null;
  issuedAt?: string | null;
  issuedToLabel?: string | null;
}

export interface CouponBatch {
  id: string;
  requestedCount: number;
  generatedCount: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  merchantId?: string;
  createdAt: string;
  coupons?: Coupon[];
}

export interface BatchStatus {
  batchId: string;
  requestedCount: number;
  generatedCount: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export interface CreateBulkCouponsRequest {
  count: number;
  discountType: "PERCENTAGE" | "FLAT_AMOUNT";
  discountValue: number;
  merchantId?: string;
  codePrefix?: string;
  expiresAt?: string;
  asyncMode?: boolean;
  theme?: CouponTheme;
}

export type UserSearchHit = {
  id: string;
  label: string;
  avatarUrl?: string | null;
};

export const couponService = {
  createBulk: (data: CreateBulkCouponsRequest) =>
    api.post<CouponBatch | BatchStatus>("/api/v1/coupons/bulk", data),

  getBatchDetails: (batchId: string) =>
    api.get<CouponBatch>(`/api/v1/coupons/batch/${batchId}`),

  getBatchStatus: (batchId: string) =>
    api.get<BatchStatus>(`/api/v1/coupons/batch/${batchId}/status`),

  getByCode: (code: string) => api.get<Coupon>(`/api/v1/coupons/${code}`),

  getMine: () => api.get<Coupon[]>("/api/v1/coupons/mine"),

  issueToUser: (code: string, userId: string) =>
    api.post<Coupon>(`/api/v1/coupons/${encodeURIComponent(code)}/issue`, { userId }),

  searchUsers: (q: string) =>
    api.get<UserSearchHit[]>(`/api/v1/users/search?q=${encodeURIComponent(q)}`),

  getExportUrl: (batchId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    return `${baseUrl}/api/v1/coupons/batch/${batchId}/export`;
  },
};
