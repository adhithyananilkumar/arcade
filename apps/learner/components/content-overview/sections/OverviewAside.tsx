'use client';

import Link from 'next/link';
import type { ContentOverviewModel } from '../contentOverview.types';

/** The "Series Info" equivalent: the handful of facts worth knowing before starting. */
export function OverviewFacts({ facts }: { facts: ContentOverviewModel['facts'] }) {
  if (facts.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Details</h2>
      <dl className="mt-3 space-y-2.5">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center gap-2.5">
            <fact.icon size={14} className="shrink-0 text-slate-400" />
            <dt className="flex-1 text-[13px] text-slate-500 dark:text-slate-400">{fact.label}</dt>
            <dd className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Who made this. One card per author or collaborator the backend returned. */
export function OverviewPeople({ people }: { people: ContentOverviewModel['people'] }) {
  if (people.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {people.length === 1 ? 'Your instructor' : 'Your instructors'}
      </h2>
      <ul className="mt-3 space-y-4">
        {people.map((person) => (
          <li key={person.name} className="flex gap-3">
            {person.avatarUrl ? (
              <img
                src={person.avatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                {person.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                {person.href ? (
                  <Link href={person.href} className="hover:underline">
                    {person.name}
                  </Link>
                ) : (
                  person.name
                )}
              </p>
              {person.headline && (
                <p className="text-[12px] text-slate-500 dark:text-slate-400">{person.headline}</p>
              )}
              {person.bio && (
                <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {person.bio}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
