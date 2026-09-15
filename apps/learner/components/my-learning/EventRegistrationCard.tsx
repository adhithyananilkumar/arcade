'use client';

/**
 * One row of `GET /api/v1/me/events`, rendered.
 *
 * Shows registration state, event subtype, delivery mode and schedule. It deliberately shows
 * **no join credentials**: `/me/events` does not send `meetingUrl`/`meetingId`/`meetingPasscode`,
 * and a list surface is the wrong place to hand out join links. The event page itself performs the
 * enrollment-scoped authorization check (`GET /api/v1/events/{id}/sessions`, D2 SEC-2 fix).
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Video, ArrowRight } from 'lucide-react';
import type { LearnerEventRegistration } from '@/domains/enrollment';
import {
  STATUS_TONE_CLASSES,
  eventHrefFor,
  eventScheduleLabel,
  eventStatusBadgeFor,
  humanizeCode,
  initialFor,
  placeholderTintFor,
} from './enrollmentPresentation';

export function EventRegistrationCard({
  registration,
  index,
}: {
  registration: LearnerEventRegistration;
  index: number;
}) {
  const badge = eventStatusBadgeFor(registration);
  const isOnline = ['ONLINE', 'HYBRID', 'RECORDED'].includes(
    String(registration.deliveryMode).toUpperCase()
  );
  const ModeIcon = isOnline ? Video : MapPin;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: Math.min(index * 0.04, 0.2) }}
      className="group relative flex flex-col sm:flex-row gap-4 sm:gap-5 overflow-hidden rounded-2xl sm:rounded-[20px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 shadow-xs hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-28 w-full sm:h-28 sm:w-28 shrink-0 rounded-xl sm:rounded-[14px] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {registration.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={registration.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${placeholderTintFor(registration.eventId)}`}
          >
            <span className="text-2xl font-black text-slate-400/70 dark:text-slate-500/70 select-none">
              {initialFor(registration.title)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {registration.title}
            </h4>
            <span
              title={badge.hint ?? undefined}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STATUS_TONE_CLASSES[badge.tone]}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {humanizeCode(registration.eventType)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-indigo-500 shrink-0" />
              {eventScheduleLabel(registration)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ModeIcon size={13} className="text-slate-400 shrink-0" />
              {humanizeCode(registration.deliveryMode)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            href={eventHrefFor(registration)}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-50 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <span>{registration.upcoming ? 'View event' : 'View details'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
