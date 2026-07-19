"use client";

import React, { Suspense } from "react";
import CategoryDetailedView from "@/apps/public/components/explore/CategoryDetailedView";

export default function CoursesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center", color: "#6B7280" }}>Loading category...</div>}>
      <CategoryDetailedView />
    </Suspense>
  );
}
