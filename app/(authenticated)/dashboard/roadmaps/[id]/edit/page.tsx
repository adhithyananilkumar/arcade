"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArcadeEditor } from "@/features/content/editor/components/ArcadeEditor";
import { roadmapService } from "@/features/content/editor/roadmap/services/roadmap";
import type { RoadmapData } from "@/features/content/editor/roadmap/types";
import type { TiptapDocument } from "@/types/editor";

export default function RoadmapEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
            href="/dashboard/roadmaps"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <ArrowLeft size={16} />
            Back to Roadmaps
          </Link>
        </div>
      </div>
    );
  }

  // Generate initial content with a single Roadmap block referencing this ID
  const initialContent: TiptapDocument = {
    type: "doc",
    content: [
      {
        type: "roadmap",
        attrs: {
          roadmapId: id,
        },
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
        <Link
          href="/dashboard/roadmaps"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">
            {roadmap.title}
          </h1>
          <p className="text-xs text-gray-500">
            Roadmap Studio
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 max-w-5xl mx-auto w-full h-full flex flex-col">
        {/* We use the editor directly. Changes to the roadmap block itself will be handled locally. */}
        {/* Note: Roadmap specific saves (Phase 5) will be added to the roadmap view directly, so we just render the editor here. */}
        <ArcadeEditor
          initialContent={initialContent}
          className="flex-1 shadow-sm h-full"
        />
      </main>
    </div>
  );
}
