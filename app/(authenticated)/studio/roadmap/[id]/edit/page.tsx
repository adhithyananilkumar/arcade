"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { roadmapService } from "@/domains/roadmaps";
import type { RoadmapData } from "@/domains/roadmaps";
import { RoadmapStudio } from "@/domains/roadmaps";
import { useRouter } from "next/navigation";

export default function RoadmapEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    roadmapService
      .getRoadmap(id)
      .then((data) => {
        setRoadmap(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading Roadmap Studio...</p>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load roadmap</h2>
          <p className="text-sm text-red-600 mb-6">{error || "Roadmap not found"}</p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <ArrowLeft size={16} />
            Back to Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      <RoadmapStudio 
        roadmap={roadmap} 
        onClose={() => router.push('/studio')}
      />
    </div>
  );
}
