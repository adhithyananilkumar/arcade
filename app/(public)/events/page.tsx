"use client";

import React, { Suspense } from "react";
import CategoryDetailedView from "@/components/explore/CategoryDetailedView";

export default function EventsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center", color: "#6B7280" }}>Loading category...</div>}>
      <CategoryDetailedView mode="events" />
    </Suspense>
  );
}
