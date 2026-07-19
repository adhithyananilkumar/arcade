import HeroNav from "@/components/landing/HeroNav";
import Footer from "@/components/landing/Footer";

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
