"use client";

import { useParams } from "next/navigation";
import { ReviewDetail } from "@/apps/core/components/reviews/ReviewDetail";

/** Console → Reviews → one review (platform stage). */
export default function ReviewDetailPage() {
  const params = useParams();
  return <ReviewDetail reviewId={params?.id as string} backHref="/console/reviews" />;
}
