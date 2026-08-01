import PublicShell from "@/apps/public/components/landing/PublicShell";
import "@/apps/public/landing.css";
import "@/components/explore/BorderGlow.css";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
