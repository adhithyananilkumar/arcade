import { Info, TriangleAlert, CircleCheck, CircleAlert } from "lucide-react";

export const CALLOUT_VARIANTS = ["info", "warning", "success", "danger"] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export const CALLOUT_ICON: Record<CalloutVariant, typeof Info> = {
  info: Info,
  warning: TriangleAlert,
  success: CircleCheck,
  danger: CircleAlert,
};

export const CALLOUT_STYLE: Record<CalloutVariant, { wrap: string; icon: string }> = {
  info: { wrap: "border-blue-200 bg-blue-50", icon: "text-blue-500" },
  warning: { wrap: "border-amber-200 bg-amber-50", icon: "text-amber-500" },
  success: { wrap: "border-emerald-200 bg-emerald-50", icon: "text-emerald-500" },
  danger: { wrap: "border-red-200 bg-red-50", icon: "text-red-500" },
};

export function toCalloutVariant(value: unknown): CalloutVariant {
  return CALLOUT_VARIANTS.includes(value as CalloutVariant) ? (value as CalloutVariant) : "info";
}
