export type CouponTheme = {
  backgroundFrom: string;
  backgroundTo: string;
  direction: string;
  accent: string;
  textColor: string;
};

export const DEFAULT_COUPON_THEME: CouponTheme = {
  backgroundFrom: "#1e1b4b",
  backgroundTo: "#312e81",
  direction: "135deg",
  accent: "#a5b4fc",
  textColor: "#ffffff",
};

export type CouponThemePalette = {
  id: string;
  name: string;
  theme: CouponTheme;
};

export const COUPON_THEME_PRESETS: CouponThemePalette[] = [
  {
    id: "sale-red",
    name: "Warm sale",
    theme: {
      backgroundFrom: "#ef4444",
      backgroundTo: "#9f1239",
      direction: "135deg",
      accent: "#fecdd3",
      textColor: "#ffffff",
    },
  },
  {
    id: "welcome-blue",
    name: "Cool welcome",
    theme: {
      backgroundFrom: "#2563eb",
      backgroundTo: "#1e3a8a",
      direction: "135deg",
      accent: "#93c5fd",
      textColor: "#ffffff",
    },
  },
  {
    id: "premium-dark",
    name: "Premium dark",
    theme: {
      backgroundFrom: "#0f172a",
      backgroundTo: "#1e293b",
      direction: "160deg",
      accent: "#fbbf24",
      textColor: "#f8fafc",
    },
  },
  {
    id: "festive-purple",
    name: "Festive purple",
    theme: {
      backgroundFrom: "#7c3aed",
      backgroundTo: "#4c1d95",
      direction: "135deg",
      accent: "#e9d5ff",
      textColor: "#ffffff",
    },
  },
  {
    id: "fresh-green",
    name: "Fresh green",
    theme: {
      backgroundFrom: "#059669",
      backgroundTo: "#064e3b",
      direction: "135deg",
      accent: "#a7f3d0",
      textColor: "#ffffff",
    },
  },
  {
    id: "sunset-orange",
    name: "Sunset",
    theme: {
      backgroundFrom: "#f97316",
      backgroundTo: "#c2410c",
      direction: "120deg",
      accent: "#ffedd5",
      textColor: "#ffffff",
    },
  },
  {
    id: "ocean-teal",
    name: "Ocean teal",
    theme: {
      backgroundFrom: "#0d9488",
      backgroundTo: "#115e59",
      direction: "145deg",
      accent: "#99f6e4",
      textColor: "#ffffff",
    },
  },
  {
    id: "slate-minimal",
    name: "Slate minimal",
    theme: {
      backgroundFrom: "#334155",
      backgroundTo: "#0f172a",
      direction: "180deg",
      accent: "#e2e8f0",
      textColor: "#f8fafc",
    },
  },
];

export function resolveCouponTheme(theme?: Partial<CouponTheme> | null): CouponTheme {
  return {
    ...DEFAULT_COUPON_THEME,
    ...(theme ?? {}),
  };
}

export function themeToCssBackground(theme: CouponTheme): string {
  const t = resolveCouponTheme(theme);
  return `linear-gradient(${t.direction}, ${t.backgroundFrom}, ${t.backgroundTo})`;
}
