import HeroNav from "@/components/landing/HeroNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeroNav />
      {children}
    </>
  );
}
