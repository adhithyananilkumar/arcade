"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { roadmapService } from "@/features/content/editor/roadmap/services/roadmap";
import type { RoadmapData } from "@/features/content/editor/roadmap/types";
import { RoadmapViewer } from "@/features/content/editor/roadmap/components/RoadmapViewer";

export default function RoadmapViewPage() {
  const params = useParams();
  const id = params?.id as string;

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    roadmapService.getRoadmap(id)
      .then(data => {
        setRoadmap(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const latestRoadmap = useRef<RoadmapData | null>(null);
  const isSaving = useRef(false);
  const pendingGraphJson = useRef<string | null>(null);

  useEffect(() => {
    if (roadmap) latestRoadmap.current = roadmap;
  }, [roadmap]);

  const processQueue = async () => {
    if (isSaving.current || !pendingGraphJson.current || !latestRoadmap.current) return;
    
    isSaving.current = true;
    const jsonToSave = pendingGraphJson.current;
    pendingGraphJson.current = null;
    
    try {
      const tempRoadmap = { ...latestRoadmap.current, graphJson: jsonToSave };
      const savedRoadmap = await roadmapService.updateRoadmap(latestRoadmap.current.id, tempRoadmap);
      latestRoadmap.current = savedRoadmap;
      setRoadmap(savedRoadmap);
    } catch (err) {
      console.error("Failed to save progress", err);
    } finally {
      isSaving.current = false;
      if (pendingGraphJson.current) {
        processQueue();
      }
    }
  };

  const handleUpdateProgress = (newGraphJson: string) => {
    if (!latestRoadmap.current) return;
    pendingGraphJson.current = newGraphJson;
    processQueue();
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500">Loading Roadmap...</div>;
  }

  if (error || !roadmap) {
    return <div className="h-full flex items-center justify-center bg-gray-50 text-red-500">Failed to load roadmap: {error}</div>;
  }

  return <RoadmapViewer roadmap={roadmap} onUpdateProgress={handleUpdateProgress} />;
}
