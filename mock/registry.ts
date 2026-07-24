/**
 * Maps incoming request paths (exactly what each domain's *.service.ts
 * passes to `api.get/post/...`) to a mock handler. Add a new resource by
 * adding fixtures + a handler (see mock/README.md) and registering its
 * routes here.
 */
import { getChannel, listChannels } from './handlers/channels';
import { getRoadmap, listRoadmaps } from './handlers/roadmaps';
import type { MockRequest, MockResult } from './handlers/shared';

type RouteHandler = (req: MockRequest, params: string[]) => MockResult;

interface Route {
  method: string;
  // Segments matched against the path split on '/'; ':param' matches any single segment.
  pattern: string[];
  handler: RouteHandler;
}

const routes: Route[] = [
  { method: 'GET', pattern: ['api', 'v1', 'channels'], handler: (req) => listChannels(req) },
  { method: 'GET', pattern: ['api', 'v1', 'channels', ':id'], handler: (req, p) => getChannel(req, p[0]) },
  { method: 'GET', pattern: ['api', 'roadmaps'], handler: (req) => listRoadmaps(req) },
  { method: 'GET', pattern: ['api', 'roadmaps', ':id'], handler: (req, p) => getRoadmap(req, p[0]) },
];

export function resolveMockRoute(method: string, pathSegments: string[]): { handler: RouteHandler; params: string[] } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    if (route.pattern.length !== pathSegments.length) continue;

    const params: string[] = [];
    const isMatch = route.pattern.every((seg, i) => {
      if (seg.startsWith(':')) {
        params.push(pathSegments[i]);
        return true;
      }
      return seg === pathSegments[i];
    });

    if (isMatch) return { handler: route.handler, params };
  }
  return null;
}
