"use client";

// The exams catalogue by category — the counterpart of /courses and /events. Explore's Exams tab
// opens here when a category (or All) is picked.

import React, { Suspense } from "react";
import CategoryDetailedView from "@/components/explore/CategoryDetailedView";

export default function ExamsCataloguePage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center", color: "#6B7280" }}>Loading category...</div>}>
      <CategoryDetailedView mode="exams" />
    </Suspense>
  );
}
