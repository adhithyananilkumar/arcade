'use client';

import Link from 'next/link';
import { Layers, Video, Clock, Award, Globe } from 'lucide-react';
import type { ContentOverviewModel } from '../contentOverview.types';

export function OverviewFacts({ facts }: { facts: ContentOverviewModel['facts'] }) {
  const defaultItems = [
    { icon: Layers, label: 'Level', value: 'Intermediate' },
    { icon: Video, label: 'Video', value: '22 Videos' },
    { icon: Clock, label: 'Duration', value: '5 Hours' },
    { icon: Award, label: 'Certificate', value: 'Yes' },
    { icon: Globe, label: 'Language', value: 'English' },
  ];

  const items = facts.length > 0
    ? facts.map(f => ({ icon: f.icon, label: f.label, value: f.value }))
    : defaultItems;

  return (
    <section className="rounded-tl-[2rem] rounded-tr-[2rem] rounded-br-[2rem] rounded-bl-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">
        Course Includes :
      </h2>
      <dl className="mt-4 space-y-3.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5 text-slate-400">
              <item.icon size={15} />
              <dt className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</dt>
            </div>
            <dd className="font-semibold text-slate-800 dark:text-slate-200">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function OverviewPeople({ people }: { people: ContentOverviewModel['people'] }) {
  if (people.length === 0) return null;

  return (
    <section className="space-y-4">
      {people.map((person) => (
        <div
          key={person.name}
          className="rounded-tl-[2rem] rounded-tr-[2rem] rounded-br-[2rem] rounded-bl-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-start gap-4"
        >
          {person.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt={person.name}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-slate-100"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#8C6453] text-xl font-bold text-white shadow-sm">
              {person.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {person.href ? (
                <Link href={person.href} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {person.name}
                </Link>
              ) : (
                person.name
              )}
            </h3>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              {person.headline || 'AUTHOR'}
            </p>

            <div className="mt-3 flex items-center gap-3 text-slate-400">
              <a href="#" aria-label="X (Twitter)" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
