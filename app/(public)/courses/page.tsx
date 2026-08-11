"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import CategoryDetailedView from "@/components/explore/CategoryDetailedView";

export default function CoursesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center", color: "#6B7280" }}>Loading category...</div>}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false, amount: 0.1 }}
        style={{ width: "100%" }}
      >
        <CategoryDetailedView />
      </motion.div>
    </Suspense>
  );
}
