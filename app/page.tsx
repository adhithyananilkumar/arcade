import { IntroProvider } from "@/components/intro/IntroProvider";
import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <IntroProvider>
      <AppShell />
    </IntroProvider>
  );
}
