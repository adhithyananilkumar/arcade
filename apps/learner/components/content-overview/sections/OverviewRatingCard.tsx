'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, PenLine, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { courseReviewService, type CourseReview } from '@/domains/learning';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

interface OverviewRatingCardProps {
  courseId: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent!',
};

export function OverviewRatingCard({ courseId }: OverviewRatingCardProps) {
  const user = useAuthStore((s) => s.user);
  const [existingReview, setExistingReview] = useState<CourseReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user's review for this course
  useEffect(() => {
    let cancelled = false;

    async function loadReview() {
      setIsLoading(true);
      try {
        // First try the dedicated /my endpoint
        let userReview = await courseReviewService.getMyReview(courseId);

        // Fallback: search public reviews for this course if current user matches
        if (!userReview && user?.id) {
          const publicReviews = await courseReviewService.listPublicForCourse(courseId).catch(() => []);
          const match = publicReviews.find((r) => r.userId === user.id);
          if (match) userReview = match;
        }

        if (!cancelled && userReview) {
          setExistingReview(userReview);
          setRating(userReview.rating);
          setReviewText(userReview.reviewText || '');
        }
      } catch {
        // Silently catch — user hasn't rated yet
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (courseId) {
      loadReview();
    }

    return () => {
      cancelled = true;
    };
  }, [courseId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please choose a rating of at least 1 star.');
      return;
    }

    setIsSubmitting(true);
    try {
      const text = reviewText.trim();
      const updated = await courseReviewService.submit(courseId, {
        rating,
        reviewText: text.length > 0 ? text : undefined,
      });

      setExistingReview(updated);
      setRating(updated.rating);
      setReviewText(updated.reviewText || '');
      setIsEditing(false);
      toast.success(existingReview ? 'Rating updated successfully!' : 'Thank you for rating this course!');
    } catch {
      toast.error('Could not save your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText || '');
      setIsEditing(false);
    } else {
      setRating(0);
      setReviewText('');
      setIsEditing(false);
    }
  };

  const activeStarCount = hoveredRating > 0 ? hoveredRating : rating;

  return (
    <section className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Star size={16} className="text-amber-500 fill-amber-400" />
          Your rating
        </h2>
        {existingReview && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/80"
          >
            <PenLine size={12} />
            Edit rating
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="mt-4 flex items-center justify-center py-4 text-slate-400">
          <Loader2 size={18} className="animate-spin text-amber-500" />
        </div>
      ) : existingReview && !isEditing ? (
        /* View mode for existing rating */
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={
                    star <= existingReview.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700'
                  }
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {existingReview.rating} / 5
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              ({RATING_LABELS[existingReview.rating] || ''})
            </span>
          </div>

          {existingReview.reviewText ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-[13px] leading-relaxed text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-300">
              &ldquo;{existingReview.reviewText}&rdquo;
            </div>
          ) : (
            <p className="text-[12px] italic text-slate-400">
              No written feedback provided.
            </p>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              <PenLine size={12} />
              Change your rating or feedback
            </button>
          </div>
        </div>
      ) : (
        /* Edit or New Rating Form */
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {existingReview ? 'Update rating' : 'Select your rating'}
            </label>
            <div
              className="flex items-center gap-1.5"
              role="radiogroup"
              aria-label="Course rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                  className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                >
                  <Star
                    size={22}
                    className={`transition-colors ${
                      star <= activeStarCount
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'fill-slate-100 text-slate-300 hover:text-slate-400 dark:fill-slate-800 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              {activeStarCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {RATING_LABELS[activeStarCount]}
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="course-review-feedback" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Review feedback <span className="normal-case text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="course-review-feedback"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you like or think could be improved about this course?"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {existingReview && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || rating < 1}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : existingReview ? (
                'Update rating'
              ) : (
                'Submit rating'
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
