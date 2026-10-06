'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Route: /events/[slug]
 *
 * Purpose:
 * Entry route for public event landing & overview.
 * Delegates rendering to the dedicated EventPublicView domain component.
 * ------------------------------------------------------------------
 */

import { useParams } from 'next/navigation';
import { EventPublicView } from '@/domains/events';

export default function EventPage() {
  const params = useParams<{ slug?: string }>();
  return <EventPublicView slug={params?.slug} />;
}
