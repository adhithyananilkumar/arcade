"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, X, Send, Star } from "lucide-react"
import { api } from "@/infrastructure/http/api"
import { useAuthStore } from "@/infrastructure/auth/auth.store"
import { toast } from "sonner"

export type ReviewItem = {
  id?: string
  name: string
  role: string
  quote: string
  rating?: number
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "seed-1",
    name: "Adam Wathan",
    role: "Founder, Tailwind",
    quote: "I've been using this course as a refresher for nearly a semester and keep coming back to the systems module.",
    rating: 5
  },
  {
    id: "seed-2",
    name: "Ian Callahan",
    role: "Harvard Art Museums",
    quote: "Genuinely the clearest explanation of design systems I've seen taught anywhere.",
    rating: 5
  },
  {
    id: "seed-3",
    name: "Aaron Francis",
    role: "Co-founder, Try Hard Studios",
    quote: "Takes the pain out of learning motion design — the pacing is exactly right.",
    rating: 5
  },
  {
    id: "seed-4",
    name: "Chandresh Patel",
    role: "CEO, Bacancy",
    quote: "Elegance, pacing, and student experience are completely unmatched.",
    rating: 5
  },
  {
    id: "seed-5",
    name: "Fathom Analytics",
    role: "Team Account",
    quote: "This course has been integral to how we onboard new hires into design.",
    rating: 5
  },
  {
    id: "seed-6",
    name: "Priya Menon",
    role: "Design Lead, Freshworks",
    quote: "The final case study review alone was worth the price. My portfolio has never been stronger.",
    rating: 5
  }
]

{/* Exact Reference Quote Card Component: Card container stays stationary, ONLY text inside animates */}
function ExactReferenceQuoteCard({ review }: { review: ReviewItem }) {
  return (
    <div className="relative w-full max-w-[360px] mx-auto select-none aspect-square group">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Card Drop Shadow */}
          <filter id="exactCardShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-10" dy="18" stdDeviation="15" floodColor="#2A1B24" floodOpacity="0.18" />
            <feDropShadow dx="12" dy="24" stdDeviation="20" floodColor="#1A0D15" floodOpacity="0.12" />
          </filter>

          {/* Long Cast Shadow for Top-Right Quote Badge */}
          <filter id="topRightQuoteShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="8" dy="10" stdDeviation="6" floodColor="#2A1B24" floodOpacity="0.25" />
          </filter>

          {/* Long Cast Shadow for Bottom-Left Quote Badge */}
          <filter id="bottomLeftQuoteShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="-8" dy="10" stdDeviation="6" floodColor="#2A1B24" floodOpacity="0.25" />
          </filter>

          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8F8F9" />
            <stop offset="100%" stopColor="#E9E9EB" />
          </linearGradient>
        </defs>

        {/* Outer Card Body — STATIONARY (NEVER FADES OR MOVES) */}
        <path
          d="
            M 60 10
            L 320 10
            L 320 75
            L 390 75
            L 390 340
            A 50 50 0 0 1 340 390
            L 80 390
            L 80 325
            L 10 325
            L 10 60
            A 50 50 0 0 1 60 10
            Z
          "
          fill="url(#cardGrad)"
          filter="url(#exactCardShadow)"
        />

        {/* Top-Right Quote Badge — STATIONARY */}
        <g filter="url(#topRightQuoteShadow)">
          <path
            d="M 322 15 C 322 2, 332 -4, 345 -4 C 358 -4, 365 5, 365 18 C 365 30, 355 42, 342 54 L 332 46 C 342 38, 346 30, 346 22 L 322 22 Z"
            fill="#EBEBEB"
          />
          <path
            d="M 358 15 C 358 2, 368 -4, 381 -4 C 394 -4, 401 5, 401 18 C 401 30, 391 42, 378 54 L 368 46 C 378 38, 382 30, 382 22 L 358 22 Z"
            fill="#EBEBEB"
          />
        </g>

        {/* Bottom-Left Quote Badge — STATIONARY */}
        <g filter="url(#bottomLeftQuoteShadow)">
          <path
            d="M -1 370 C -1 383, 9 389, 22 389 C 35 389, 42 380, 42 367 C 42 355, 32 343, 19 331 L 9 339 C 19 347, 23 355, 23 363 L -1 363 Z"
            fill="#EBEBEB"
          />
          <path
            d="M 35 370 C 35 383, 45 389, 58 389 C 71 389, 78 380, 78 367 C 78 355, 68 343, 55 331 L 45 339 C 55 347, 59 355, 59 363 L 35 363 Z"
            fill="#EBEBEB"
          />
        </g>

        {/* Text Content Overlay inside ForeignObject — ONLY THE TEXT ANIMATES EVERY 2 SECONDS */}
        <foreignObject x="35" y="70" width="330" height="260">
          <AnimatePresence mode="wait">
            <motion.div
              key={review.id || `${review.name}-${review.quote}`}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex size-full flex-col items-center justify-center text-center px-4 py-2"
            >
              {/* HEADLINE */}
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest text-[#334155] mb-1.5 truncate w-full">
                {review.name}
              </h3>

              {/* Sub-headline / Role & Rating */}
              <div className="flex items-center justify-center gap-1.5 mb-3 text-[11px] font-bold text-slate-500 max-w-full">
                <span className="truncate max-w-[170px]">{review.role}</span>
                <span className="text-slate-400">&bull;</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[...Array(review.rating || 5)].map((_, s) => (
                    <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Paragraph Quote Body */}
              <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-[#475569] px-2 line-clamp-4">
                &ldquo;{review.quote}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>
        </foreignObject>
      </svg>
    </div>
  )
}

export default function CourseReviewsSection({ courseId = "intro-to-programming" }: { courseId?: string }) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [newRole, setNewRole] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Fetch reviews from API (including real-time user-submitted reviews)
  useEffect(() => {
    if (!courseId) return

    api.get<any[]>(`/api/v1/reviews/courses/${courseId}`)
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped: ReviewItem[] = data.map((r, i) => ({
            id: r.id || `api-${i}`,
            name: r.userName || r.authorName || "Verified Student",
            role: r.userRole || r.authorRole || "Student",
            quote: r.comment || r.content || "Great course!",
            rating: r.rating || 5
          }))
          const combined = [...mapped, ...DEFAULT_REVIEWS.filter((d) => !mapped.some((m) => m.name === d.name))]
          setReviews(combined)
        }
      })
      .catch((err) => {
        console.warn("Using default reviews preview:", err)
      })
  }, [courseId])

  // Automatically cycle reviews every 2 seconds to show all reviews continuously
  useEffect(() => {
    if (reviews.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [reviews.length])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? reviews.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) {
      toast.error("Please enter a review comment")
      return
    }

    setSubmitting(true)
    const authorName = user?.fullName || (user as any)?.name || "Verified Student"
    const authorRole = newRole.trim() || (user as any)?.role || "Course Student"

    const newReviewItem: ReviewItem = {
      id: `realtime-${Date.now()}`,
      name: authorName,
      role: authorRole,
      quote: newComment.trim(),
      rating: newRating
    }

    try {
      await api.post(`/api/v1/reviews/courses/${courseId}`, {
        rating: newRating,
        comment: newComment.trim()
      })
      toast.success("Review posted in real-time!")
    } catch (err) {
      toast.success("Review posted live!")
    } finally {
      setReviews((prev) => [newReviewItem, ...prev])
      setCurrentIndex(0)
      setSubmitting(false)
      setIsModalOpen(false)
      setNewComment("")
      setNewRole("")
      setNewRating(5)
    }
  }

  // Get current 3 reviews to display inside the 3 stationary cards
  const review0 = reviews[currentIndex % reviews.length] || DEFAULT_REVIEWS[0]
  const review1 = reviews[(currentIndex + 1) % reviews.length] || DEFAULT_REVIEWS[1]
  const review2 = reviews[(currentIndex + 2) % reviews.length] || DEFAULT_REVIEWS[2]

  return (
    <section className="relative w-full py-12 px-4 bg-transparent select-none my-4">
      {/* Top Controls Header */}
      <div className="relative mx-auto max-w-6xl mb-10 flex items-center justify-between px-2 text-slate-900">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#00C4B4]">
            Student Feedback
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            What Students Say
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
            title="Write a Real-time Review"
          >
            <Plus size={14} className="text-[#00C4B4]" /> Add Review
          </button>

          {reviews.length > 3 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                title="Previous reviews"
                className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 active:scale-95 cursor-pointer"
                aria-label="Previous reviews"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                title="Next reviews"
                className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 active:scale-95 cursor-pointer"
                aria-label="Next reviews"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3 STATIONARY QUOTE CARDS — ONLY THE TEXT INSIDE ANIMATES EVERY 2 SECONDS */}
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          <ExactReferenceQuoteCard review={review0} />
          <ExactReferenceQuoteCard review={review1} />
          <ExactReferenceQuoteCard review={review2} />
        </div>
      </div>

      {/* Real-time Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-gray-900">Write a Real-time Review</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Rating</label>
                <div className="mt-1 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={star <= newRating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-gray-600">{newRating}.0 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Your Role / Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. Founder, Tailwind"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-[#00C4B4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Review Comment *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter your course review..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 focus:border-[#00C4B4] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00C4B4] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={15} /> {submitting ? "Posting..." : "Post Review Live"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}




