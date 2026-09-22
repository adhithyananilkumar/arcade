"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Users, Clock } from "lucide-react";
import { getEventById } from "../api/event.service";
import type { EventDto } from "../types/event.types";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { formatMoney } from "@/shared/utils/money";
import {
  EnrollmentButton,
  useMyEnrollmentForResourceQuery,
  type UIEnrollmentState,
} from "@/domains/enrollment";

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = params.slug as string;
    getEventById(slug)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Server-owned, same read model the course page uses. ACCESSIBLE is the only state that counts
  // as enrolled — a PENDING (unpaid / awaiting approval) registration must not present itself as
  // access to the event hub.
  const { data: myEnrollment } = useMyEnrollmentForResourceQuery(
    "EVENT",
    event?.id || undefined,
    Boolean(user) && Boolean(event?.id),
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Event not found.</div>;

  const enrollmentStatus = myEnrollment?.enrollment?.enrollmentStatus;
  const enrollButtonState: UIEnrollmentState =
    myEnrollment?.enrollment?.accessState === "ACCESSIBLE"
      ? "ENROLLED"
      : enrollmentStatus === "PENDING" || enrollmentStatus === "REQUESTED"
        ? "PENDING"
        : "NOT_ENROLLED";

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

        {/* The real enrolment control, not a link to the hub: this button used to navigate
            straight to /events/{slug}/learn without enrolling anyone, which the hub — now that it
            redirects the unentitled back here — would bounce straight back. */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {event.priceAmount > 0 ? formatMoney(event.priceAmount, event.currency) : "Free"}
          </span>
          <div className="min-w-[220px]">
            <EnrollmentButton
              resourceType="EVENT"
              resourceId={event.id}
              initialState={enrollButtonState}
              pendingReason={myEnrollment?.enrollment?.requiresPayment ? "PAYMENT" : "REQUIREMENTS"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
