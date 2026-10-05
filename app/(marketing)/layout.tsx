import MarketingShell from "@/apps/public/components/landing/MarketingShell";

/**
 * Arcade's marketing site: the landing page and the About / Creators / Contributors / Founders /
 * Privacy / Terms / Reach-us pages. A route group of its own so these pages never share a layout
 * with the signed-in app — whoever is looking, they render the same standard light design.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
