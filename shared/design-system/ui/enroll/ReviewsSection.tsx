'use client';

import { Star } from 'lucide-react';
import { getAvatarUrl } from '@/shared/utils/avatar';

export interface EnrollReview {
  id: string;
  rating: number;
  text?: string | null;
  name: string;
  avatarUrl?: string | null;
  /** Secondary line next to the stars (a role, or the date). */
  subtitle?: string | null;
}

export interface ReviewsSectionProps {
  reviews: readonly EnrollReview[];
  /** Average rating across all ratings, not just the ones with text. */
  average: number;
  /** How many ratings back the average. */
  ratingCount: number;
  /** What was reviewed, for the empty state: "course", "event". */
  noun?: string;
}

const ACCENTS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

function Stars({ value, size }: { value: number; size: number }) {
  const full = Math.round(value);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= full ? 'text-amber' : 'text-line'}
          fill={i <= full ? 'currentColor' : 'none'}
          strokeWidth={i <= full ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

function ReviewerAvatar({ review, accent, onDark }: { review: EnrollReview; accent: string; onDark: boolean }) {
  const url = getAvatarUrl(review.avatarUrl);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={review.name} className="size-8 shrink-0 rounded-full object-cover" />;
  }
  const initials = review.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      className={`grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${onDark ? 'ring-1 ring-white/20' : ''}`}
      style={{ background: accent }}
    >
      {initials || '?'}
    </div>
  );
}

/** Ratings summary and a masonry of review cards, the same on every enroll page. */
export function ReviewsSection({ reviews, average, ratingCount, noun = 'course' }: ReviewsSectionProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-amber/15 text-amber">
          <Star size={18} fill="currentColor" strokeWidth={0} />
        </div>
        <h3 className="text-base font-semibold text-ink">No reviews yet</h3>
        <p className="mt-1 text-sm text-subtle">{`Be the first to review this ${noun}.`}</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="enroll-reviews-heading">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
          <Star size={13} className="text-amber" fill="currentColor" strokeWidth={0} /> Reviews
        </span>
        <h2 id="enroll-reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
          Rated <span className="italic text-blue">{average.toFixed(1)}</span> by {ratingCount.toLocaleString()}{' '}
          {ratingCount === 1 ? 'learner' : 'learners'}
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl font-light text-ink">{average.toFixed(1)}</span>
          <div className="text-left">
            <Stars value={average} size={14} />
            <p className="mt-0.5 text-xs text-subtle">{ratingCount.toLocaleString()} ratings</p>
          </div>
        </div>
      </div>

      <div className="[column-gap:1rem] sm:columns-2 lg:columns-3">
        {reviews.map((r, i) => {
          // Every fourth written review is the dark card, which breaks up the grid.
          const dark = Boolean(r.text) && i % 4 === 1;
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <div
              key={r.id}
              className={`mb-4 break-inside-avoid rounded-2xl p-6 ${dark ? 'bg-ink' : 'border border-line bg-paper'}`}
            >
              {r.text ? (
                <p className={`text-[15px] leading-relaxed ${dark ? 'font-medium text-on-ink' : 'text-ink'}`}>
                  &ldquo;{r.text}&rdquo;
                </p>
              ) : (
                <p className={`text-sm italic ${dark ? 'text-on-ink/70' : 'text-subtle'}`}>
                  {`Rated this ${r.rating} out of 5 stars.`}
                </p>
              )}
              <div
                className={`mt-5 flex items-center justify-between gap-3 border-t pt-4 ${dark ? 'border-white/10' : 'border-line'}`}
              >
                <div className="min-w-0">
                  <p className={`truncate text-[13px] font-semibold ${dark ? 'text-on-ink' : 'text-ink'}`}>{r.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars value={r.rating} size={10} />
                    {r.subtitle && (
                      <span className={`truncate text-[11px] ${dark ? 'text-on-ink/50' : 'text-subtle'}`}>
                        {r.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                <ReviewerAvatar review={r} accent={accent} onDark={dark} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
