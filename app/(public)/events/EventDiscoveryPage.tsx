"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublishedEvents } from "./api/event.service";
import type { EventDto } from "./types/event.types";

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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Events</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Discover workshops, webinars, bootcamps, and more.
        </p>

        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-8"
        />

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-500">No events found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug || event.id}`}
                className="block rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {event.coverImageUrl && (
                  <img src={event.coverImageUrl} alt={event.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase text-violet-600 dark:text-violet-400">
                    {event.eventType}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <span>{event.deliveryMode}</span>
                    <span>·</span>
                    <span>{event.difficulty}</span>
                    {event.capacity && <><span>·</span><span>{event.capacity} seats</span></>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
