"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublishedEvents } from "@/domains/events";
import type { EventDto } from "@/domains/events";
import { UnifiedContentCard } from "@/shared/design-system/ui/cards";


export function EventDiscoveryPage() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPublishedEvents({ search: search || undefined })
      .then((res) => setEvents(res.content ?? []))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Events</h1>
        <p className="text-gray-500 mb-8">
          Discover workshops, webinars, bootcamps, and more.
        </p>

        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 bg-surface text-gray-900 mb-8"
        />

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-500">No events found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <UnifiedContentCard
                key={event.id}
                id={event.id}
                title={event.title}
                type={event.eventType || 'EVENT'}
                category={event.category}
                description={event.subtitle}
                channelName={event.channelName}
                channelIconUrl={event.channelIconUrl}
                metadataBadges={
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {event.deliveryMode && <span>{event.deliveryMode}</span>}
                    {event.difficulty && (
                      <>
                        <span>·</span>
                        <span>{event.difficulty}</span>
                      </>
                    )}
                    {event.capacity && (
                      <>
                        <span>·</span>
                        <span>{event.capacity} seats</span>
                      </>
                    )}
                  </div>
                }
                actionHref={`/events/${event.slug || event.id}`}
                actionLabel="View Details"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
