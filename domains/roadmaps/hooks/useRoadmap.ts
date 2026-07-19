'use client';

import { useState, useEffect } from "react";
import { roadmapService } from "../services/roadmap";
import type { RoadmapData } from "../types";

export function useRoadmap(roadmapId: string | null) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roadmapId) return;

    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
    });

    roadmapService
      .getRoadmap(roadmapId)
      .then((data) => {
        if (isMounted) {
          setRoadmap(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [roadmapId]);

  return { roadmap, loading, error };
}
