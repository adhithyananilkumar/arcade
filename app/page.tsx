import AppShellResolver from "@/apps/core/layout/AppShellResolver";
import { Suspense } from "react";

export default function RootPage() {
  return (
    <Suspense
      fallback={
        <div
          className="fixed inset-0 z-[9999] pointer-events-none select-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 42%, #f6f6f6 0%, #ffffff 65%)",
          }}
        />
      }
    >
      <AppShellResolver />
    </Suspense>
  );
}
