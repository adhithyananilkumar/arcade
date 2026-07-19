import HeroNav from "@/apps/public/components/landing/HeroNav";
import Footer from "@/apps/public/components/landing/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeroNav />
      {children}
      <Footer />
    </>
  );
}
