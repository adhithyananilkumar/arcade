"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { getEventById } from "../api/event.service";
import type { EventDto } from "../types/event.types";
import { useAuthStore } from "@/infrastructure/auth/auth.store";

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = params.slug as string;
    getEventById(slug)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Event not found.</div>;

  const handleEnroll = () => {
    if (!user) {
      router.push(`/login?redirect=/events/${event.slug || event.id}`);
      return;
    }
    router.push(`/events/${event.slug || event.id}/learn`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {event.coverImageUrl && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-3 py-1 rounded-full">
          {event.eventType}
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">{event.title}</h1>
        {event.subtitle && <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">{event.subtitle}</p>}

        <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {event.deliveryMode}</span>
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {event.difficulty}</span>
          {event.capacity && <span className="flex items-center gap-1.5">{event.capacity} seats</span>}
        </div>

        <div className="mt-8 prose dark:prose-invert max-w-none">
          {event.description ? <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p> : (
            <p className="text-gray-400 italic">No description provided.</p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={handleEnroll}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            {event.price > 0 ? `Enroll — $${event.price}` : "Enroll for Free"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
