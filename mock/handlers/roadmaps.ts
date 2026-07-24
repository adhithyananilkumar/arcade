import roadmaps from '../data/roadmaps.json';
import type { RoadmapData } from '../types';
import { itemOr404, listResponse, maybeError, type MockRequest, type MockResult } from './shared';

const DATA = roadmaps as RoadmapData[];

export function listRoadmaps(req: MockRequest): MockResult {
  return listResponse(DATA, req, (i) => ({
    ...DATA[0],
    id: `roadmap-long-${i}`,
    title: `Generated Roadmap ${i}`,
  }));
}

export function getRoadmap(req: MockRequest, id: string): MockResult {
  const err = maybeError(req);
  if (err) return err;
  return itemOr404(DATA.find((r) => r.id === id));
}
