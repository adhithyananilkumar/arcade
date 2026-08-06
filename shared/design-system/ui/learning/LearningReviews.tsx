import React from "react"
import { Star } from "lucide-react"
import { Avatar } from "./LearningDecorations"

export interface ReviewItem {
  name: string
  role: string
  quote: string
  dark: boolean
  accent: string
  avatarUrl?: string | null
}

export interface LearningReviewsProps {
  headingText?: React.ReactNode
  averageRating?: number
  totalRatings?: number
  reviews: ReviewItem[]
}

export function LearningReviews({
  headingText = (
    <>
      Loved by <span className="italic text-blue">12,480</span> builders
    </>
  ),
  averageRating = 4.9,
  totalRatings = 812,
  reviews,
}: LearningReviewsProps) {
  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
          <Star size={13} className="text-amber" fill="var(--color-amber)" strokeWidth={0} /> Reviews
        </span>
        <h2 id="reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
          {headingText}
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl font-light text-ink">{averageRating.toFixed(1)}</span>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} className="text-amber" fill="var(--color-amber)" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-0.5 text-xs text-subtle">{totalRatings.toLocaleString()} ratings</p>
          </div>
        </div>
      </div>

      <div className="[column-gap:1rem] sm:columns-2 lg:columns-3">
        {reviews.map((r, i) => (
          <div
            key={i}
            className={`mb-4 break-inside-avoid rounded-2xl p-6 ${r.dark ? "bg-ink" : "border border-line bg-paper"}`}
          >
            <p className={`text-[15px] leading-relaxed ${r.dark ? "font-medium text-paper" : "text-ink"}`}>
              &ldquo;{r.quote}&rdquo;
            </p>
            <div
              className={`mt-5 flex items-center justify-between border-t pt-4 ${
                r.dark ? "border-white/10" : "border-line"
              }`}
            >
              <div>
                <p className={`text-[13px] font-semibold ${r.dark ? "text-paper" : "text-ink"}`}>{r.name}</p>
                <p className={`text-[11px] ${r.dark ? "text-white/50" : "text-subtle"}`}>{r.role}</p>
              </div>
              <Avatar name={r.name} imageUrl={r.avatarUrl} accent={r.accent} size={32} onDark={r.dark} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
