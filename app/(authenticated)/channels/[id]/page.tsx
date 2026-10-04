'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * `/channels/<id>` — resolves a channel id to its one public page. See
 * `ChannelAddressOrchestrator`.
 *
 * Rules:
 * - Routing only. Reads the route parameter and delegates.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useParams } from 'next/navigation';
import { ChannelAddressOrchestrator } from '@/apps/public/orchestrators/ChannelAddressOrchestrator';

export default function ChannelPage() {
  const params = useParams();
  const channelId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  if (!channelId) return null;
  return <ChannelAddressOrchestrator channelId={channelId} />;
}
