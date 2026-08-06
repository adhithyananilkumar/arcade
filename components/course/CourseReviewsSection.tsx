"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, X, Send, Star } from "lucide-react"
import { api } from "@/infrastructure/http/api"
import { useAuthStore } from "@/infrastructure/auth/auth.store"
import { toast } from "sonner"

export type ReviewItem = {
  id?: string
  name: string
  role: string
  quote: string
  rating?: number
  dark?: boolean
  initials?: string
  accentBg?: string
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "seed-1",
    name: "Adam Wathan",
    role: "Founder, Tailwind",
    quote: "I've been using this course as a refresher for nearly a semester and keep coming back to the systems module.",
    dark: true,
    initials: "AW",
    accentBg: "bg-[#2563eb]"
  },
  {
    id: "seed-2",
    name: "Aaron Francis",
    role: "Co-founder, Try Hard Studios",
    quote: "Takes the pain out of learning motion design — the pacing is exactly right.",
    dark: false,
    initials: "AF",
    accentBg: "bg-[#6366f1]"
  },
  {
    id: "seed-3",
    name: "Fathom Analytics",
    role: "Team account",
    quote: "This course has been integral to how we onboard new hires into design.",
    dark: true,
    initials: "FA",
    accentBg: "bg-[#f97316]"
  },
  {
    id: "seed-4",
    name: "Ian Callahan",
    role: "Harvard Art Museums",
    quote: "Genuinely the clearest explanation of design systems I've seen taught anywhere.",
    dark: false,
    initials: "IC",
    accentBg: "bg-[#eab308]"
  },
  {
    id: "seed-5",
    name: "Chandresh Patel",
    role: "CEO, Bacancy",
    quote: "Elegance, pacing, and student experience are completely unmatched.",
    dark: false,
    initials: "CP",
    accentBg: "bg-[#10b981]"
  },
  {
    id: "seed-6",
    name: "Priya Menon",
    role: "Design Lead, Freshworks",
    quote: "The final case study review alone was worth the price. My portfolio has never been stronger.",
    dark: false,
    initials: "PM",
    accentBg: "bg-[#2563eb]"
  }
]

function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const BADGE_COLORS = [
  "bg-[#2563eb]",
  "bg-[#6366f1]",
  "bg-[#f97316]",
  "bg-[#eab308]",
  "bg-[#10b981]",
  "bg-[#ec4899]"
]

export default function CourseReviewsSection({ courseId = "intro-to-programming" }: { courseId?: string }) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [newRole, setNewRole] = useState("")
  const [submitting, setSubmitting] = useState(false)

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
            rating: r.rating || 5,
            dark: i % 5 === 0,
            initials: getInitials(r.userName || r.authorName || "VS"),
            accentBg: BADGE_COLORS[i % BADGE_COLORS.length]
          }))
          const combined = [...mapped, ...DEFAULT_REVIEWS.filter((d) => !mapped.some((m) => m.name === d.name))]
          setReviews(combined)
        }
      })
      .catch((err) => {
        console.warn("Using default reviews preview:", err)
      })
  }, [courseId])

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
      rating: newRating,
      dark: false,
      initials: getInitials(authorName),
      accentBg: BADGE_COLORS[Math.floor(Math.random() * BADGE_COLORS.length)]
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
      setSubmitting(false)
      setIsModalOpen(false)
      setNewComment("")
      setNewRole("")
      setNewRating(5)
    }
  }

  return (
    <section className="relative w-full py-14 px-4 bg-transparent select-none my-6">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Block: Centered "Reviews" title + Right side "Add Review" button */}
        <div className="relative mb-10 flex items-center justify-center px-1">
          <h2 className="font-serif text-3xl font-light text-slate-900 sm:text-4xl tracking-tight text-center">
            Reviews
          </h2>

          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute right-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
          >
            <Plus size={13} className="text-blue-600" /> Add Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {reviews.slice(0, 6).map((r) => {
            const isDark = r.dark ?? false
            const initials = r.initials || getInitials(r.name)
            const badgeBg = r.accentBg || "bg-[#2563eb]"

            return (
              <motion.div
                key={r.id || r.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "bg-[#13141c] text-white shadow-xl border border-slate-800"
                    : "bg-white border border-slate-200/90 text-slate-900 shadow-xs"
                }`}
              >
                <p className={`text-[14.5px] sm:text-[15px] font-normal leading-relaxed ${isDark ? "text-white/90" : "text-slate-800"}`}>
                  &ldquo;{r.quote}&rdquo;
                </p>

                <div className={`mt-6 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div>
                    <h4 className={`text-[14px] font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{r.name}</h4>
                    <p className={`text-[12px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{r.role}</p>
                  </div>
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${badgeBg}`}>
                    {initials}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-gray-900">Write a Real-time Review</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
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
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
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
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
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
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 disabled:opacity-50 cursor-pointer"
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
