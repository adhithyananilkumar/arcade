/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App / Route Handler
 *
 * Purpose:
 * Dev-only mock backend. infrastructure/http/api.ts points its BASE_URL
 * here when NEXT_PUBLIC_USE_MOCKS=true, so every existing *.service.ts
 * call is served from mock/ fixtures with zero domain/app code changes.
 * Not reachable in a production build — see next.config.ts guard.
 * ------------------------------------------------------------------
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveMockRoute } from '@/mock/registry';
import type { MockRequest } from '@/mock/handlers/shared';

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true') {
    return NextResponse.json({ message: 'Not found', status: 404 }, { status: 404 });
  }

  const { path } = await ctx.params;

  const mockReq: MockRequest = {
    method: req.method,
    searchParams: req.nextUrl.searchParams,
    body: req.method === 'GET' || req.method === 'DELETE' ? undefined : await req.json().catch(() => undefined),
  };

  const match = resolveMockRoute(req.method, path);
  if (!match) {
    return NextResponse.json({ message: `No mock route for ${req.method} /${path.join('/')}`, status: 404 }, { status: 404 });
  }

  const result = match.handler(mockReq, match.params);
  return NextResponse.json(result.body, { status: result.status });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
