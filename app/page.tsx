import AppShellResolver from "@/apps/core/layout/AppShellResolver";
import { Suspense } from "react";

export default function RootPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-white dark:bg-black" />}>
      <AppShellResolver />
    </Suspense>
  );
}
