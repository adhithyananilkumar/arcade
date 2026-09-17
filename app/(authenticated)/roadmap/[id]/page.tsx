"use client";

import { use, useEffect, useState } from "react";
import { roadmapService, type RoadmapData } from "@/domains/roadmaps";
import { SerpentineRoadmap } from "@/features/roadmap/renderer/components/SerpentineRoadmap";

export default function RoadmapViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);

  useEffect(() => {
    // Only attempt fetch if id looks like a real UUID from backend
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      roadmapService
        .getRoadmap(id)
        .then((data) => setRoadmap(data))
        .catch(() => {
          // Fall back gracefully to default frontend curriculum
        });
    }
  }, [id]);

  const displayTitle = roadmap?.title || (id === "frontend" ? "Frontend Developer" : id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
  const displayDesc = roadmap?.description || "Build real-world skills, create amazing user experiences and become a confident frontend developer. Follow this structured path to go from basics to advanced concepts with hands-on practice.";

  return (
    <main className="flex-1 flex flex-col w-full min-h-screen relative m-0 p-0 overflow-x-hidden bg-[#F8FAFC]">
      <SerpentineRoadmap
        roadmapId={id}
        title={displayTitle}
        description={displayDesc}
        graphJson={roadmap?.graphJson || ""}
      />
    </main>
  );
}
