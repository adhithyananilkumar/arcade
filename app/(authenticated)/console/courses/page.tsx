"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Compat redirect: Course Management → Platform Reviews */
export default function LegacyCourseReviewRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/console/reviews");
  }, [router]);
  return (
    <div className="flex justify-center py-20">
      <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
    </div>
  );
}
