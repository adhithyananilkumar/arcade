"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Video, BookOpen, ArrowLeft } from "lucide-react";
import { getEventById } from "@/app/(public)/events/api/event.service";
import type { EventDto } from "@/app/(public)/events/types/event.types";
import { useAuthStore } from "@/infrastructure/auth/auth.store";

export default function EventLearnPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/events/${params.slug}/learn`);
      return;
    }
    // We should ideally call an API like getEventLearningContent(params.slug)
    // which enforces backend enrollment checks, rather than just getEventById.
    getEventById(params.slug as string)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [params.slug, user, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Event not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push(`/events/${event.slug || event.id}`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to event
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
          <p className="mt-2 text-violet-600 dark:text-violet-400 font-semibold">{event.eventType}</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Learning Content */}
            <div className="p-6 rounded-xl bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-900">
              <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Event Content</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Event learning resources will appear here.
              </p>
            </div>

            {/* Schedule */}
            <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Session schedule will appear here.</p>
            </div>

            {/* Meeting/Online */}
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900">
              <Video className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {event.deliveryMode === 'ONLINE' ? 'Join Online' : 'Location'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.deliveryMode === 'ONLINE' ? 'Meeting link will appear here.' : 'Venue details will appear here.'}
              </p>
            </div>

            {/* Resources */}
            <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900">
              <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resources</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Event resources will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
