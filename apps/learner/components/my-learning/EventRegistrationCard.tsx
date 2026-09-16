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

import { LetterVectorArt } from './LetterVectorArt';

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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.2) }}
      className="group relative flex flex-col sm:flex-row gap-4 sm:gap-5 overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.04)] hover:shadow-[0_12px_36px_rgba(20,20,43,0.07)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-28 w-full sm:h-28 sm:w-28 shrink-0 rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-md rounded-bl-md overflow-hidden border border-slate-200/70 dark:border-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
        <LetterVectorArt
          title={registration.title}
          id={registration.eventId || registration.enrollmentId}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[15px] font-bold text-[#14142b] dark:text-white line-clamp-2 leading-snug group-hover:text-[#4C6FFF] dark:group-hover:text-indigo-400 transition-colors">
              {registration.title}
            </h4>
            <span
              title={badge.hint ?? undefined}
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_TONE_CLASSES[badge.tone]}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {humanizeCode(registration.eventType)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-[#4C6FFF] shrink-0" />
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
            className="inline-flex items-center gap-1.5 rounded-tr-lg rounded-bl-lg rounded-tl-xs rounded-br-xs bg-[#12141C] hover:bg-[#232735] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-1.5 text-[12px] font-semibold transition-all shadow-sm hover:gap-2"
          >
            <span>{registration.upcoming ? 'View event' : 'View details'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
