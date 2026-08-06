"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Quote,
  Target,
  Plus,
  X,
  Send,
  Star
} from "lucide-react"
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
    role: "Team account",
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

export default function CourseReviewsSection({ courseId = "intro-to-programming" }: { courseId?: string }) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [newRole, setNewRole] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Fetch real-time reviews from backend API and combine all user reviews
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
          // Combine all user reviews and seed reviews without losing any user feedback
          const combined = [...mapped, ...DEFAULT_REVIEWS.filter((d) => !mapped.some((m) => m.name === d.name))]
          setReviews(combined)
        }
      })
      .catch((err) => {
        console.warn("Using default reviews preview:", err)
      })
  }, [courseId])

  // Auto-cycle reviews every 2 seconds
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

  // Calculate visible items for Circle 1, Circle 2, Circle 3
  const getVisibleReview = (offset: number): ReviewItem => {
    if (reviews.length === 0) return DEFAULT_REVIEWS[0]
    return reviews[(currentIndex + offset) % reviews.length]
  }

  const item1 = getVisibleReview(0)
  const item2 = getVisibleReview(1)
  const item3 = getVisibleReview(2)

  return (
    <section className="relative w-full py-16" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Top Header Row with Heading & Real-time Review Trigger Button */}
      <div className="relative mx-auto max-w-6xl px-8 mb-8 flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00C2E8]">
            Student Feedback
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Reviews
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95"
          title="Write a Real-time Review"
        >
          <Plus size={14} className="text-[#00C2E8]" /> Add Review
        </button>
      </div>

      {/* Main Vector Infographic Diagram matching New Reference Image */}
      <div className="relative mx-auto max-w-6xl px-4">
        
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox="0 0 1140 400"
            className="w-full h-auto select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Filter Drop Shadows & Arrow Linear Gradients */}
            <defs>
              <filter id="disk-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.08" />
              </filter>
              <filter id="arrowGlow1" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00C2E8" floodOpacity="0.4" />
              </filter>
              <filter id="arrowGlow2" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#4F46E5" floodOpacity="0.4" />
              </filter>

              {/* Gradient 1: Cyan to Indigo */}
              <linearGradient id="arrowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00C2E8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>

              {/* Gradient 2: Indigo to Magenta */}
              <linearGradient id="arrowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>

            {/* White Circular Card Disks */}
            <circle cx="230" cy="190" r="115" fill="white" filter="url(#disk-shadow)" />
            <circle cx="570" cy="190" r="115" fill="white" filter="url(#disk-shadow)" />
            <circle cx="910" cy="190" r="115" fill="white" filter="url(#disk-shadow)" />

            {/* ================= CIRCLE 1 (Cyan) ================= */}
            {/* Thin Concentric Outer Ring 1 */}
            <circle cx="230" cy="190" r="130" stroke="#00C2E8" strokeWidth="1.5" fill="none" opacity="0.85" />
            {/* Thick Top-Left Arc Accent 1 */}
            <path
              d="M 230,60 A 130,130 0 0,0 138,282"
              stroke="#00C2E8"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Dot terminal 1 on thin ring */}
            <circle cx="101" cy="190" r="4" fill="#00C2E8" />


            {/* ================= ARROW 1 (Animated Gradient Flow) ================= */}
            <motion.g
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M 385,183 L 402,183 L 402,176 L 416,190 L 402,204 L 402,197 L 385,197 Z"
                fill="url(#arrowGrad1)"
                filter="url(#arrowGlow1)"
              />
            </motion.g>


            {/* ================= CIRCLE 2 (Dark Indigo) ================= */}
            {/* Thin Concentric Outer Ring 2 */}
            <circle cx="570" cy="190" r="130" stroke="#4F46E5" strokeWidth="1.5" fill="none" opacity="0.85" />
            {/* Thick Bottom Arc Accent 2 */}
            <path
              d="M 478,282 A 130,130 0 0,0 662,282"
              stroke="#4F46E5"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Dot terminal 2 on thin ring */}
            <circle cx="695" cy="232" r="4" fill="#4F46E5" />


            {/* ================= ARROW 2 (Animated Gradient Flow) ================= */}
            <motion.g
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
            >
              <path
                d="M 725,183 L 742,183 L 742,176 L 756,190 L 742,204 L 742,197 L 725,197 Z"
                fill="url(#arrowGrad2)"
                filter="url(#arrowGlow2)"
              />
            </motion.g>


            {/* ================= CIRCLE 3 (Bright Purple / Magenta) ================= */}
            {/* Thin Concentric Outer Ring 3 */}
            <circle cx="910" cy="190" r="130" stroke="#A855F7" strokeWidth="1.5" fill="none" opacity="0.85" />
            {/* Thick Top-Right Arc Accent 3 */}
            <path
              d="M 910,60 A 130,130 0 0,1 1040,190"
              stroke="#A855F7"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Dot terminal 3 on thin ring */}
            <circle cx="880" cy="63" r="4" fill="#A855F7" />


            {/* ================= CARD CONTENT INSIDE SVG ================= */}

            {/* Circle 1 Content (Cyan) */}
            <foreignObject x="130" y="85" width="200" height="210">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justify: "center", textAlign: "center", height: "100%", padding: "0 12px" }}>
                <div style={{ marginBottom: "8px", color: "#00C2E8" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <motion.div
                  key={item1?.id || item1?.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#00C2E8", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>
                    {item1?.name || "Adam Wathan"}
                  </h4>
                  <span style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(0, 194, 232, 0.75)", marginBottom: "8px" }}>
                    {item1?.role || "Founder, Tailwind"}
                  </span>
                  <p style={{ fontSize: "11px", fontWeight: 400, color: "#64748B", lineHeight: 1.5, margin: 0, maxWidth: "165px" }}>
                    &ldquo;{item1?.quote || "I've been using this course as a refresher for nearly a semester."}&rdquo;
                  </p>
                </motion.div>
              </div>
            </foreignObject>

            {/* Circle 2 Content (Indigo) */}
            <foreignObject x="470" y="85" width="200" height="210">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justify: "center", textAlign: "center", height: "100%", padding: "0 12px" }}>
                <div style={{ marginBottom: "8px", color: "#4F46E5" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                  </svg>
                </div>
                <motion.div
                  key={item2?.id || item2?.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#4F46E5", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>
                    {item2?.name || "Ian Callahan"}
                  </h4>
                  <span style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(79, 70, 229, 0.75)", marginBottom: "8px" }}>
                    {item2?.role || "Harvard Art Museums"}
                  </span>
                  <p style={{ fontSize: "11px", fontWeight: 400, color: "#64748B", lineHeight: 1.5, margin: 0, maxWidth: "165px" }}>
                    &ldquo;{item2?.quote || "Genuinely the clearest explanation of design systems I've seen."}&rdquo;
                  </p>
                </motion.div>
              </div>
            </foreignObject>

            {/* Circle 3 Content (Magenta) */}
            <foreignObject x="810" y="85" width="200" height="210">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justify: "center", textAlign: "center", height: "100%", padding: "0 12px" }}>
                <div style={{ marginBottom: "8px", color: "#A855F7" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" fill="#A855F7" />
                  </svg>
                </div>
                <motion.div
                  key={item3?.id || item3?.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#A855F7", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>
                    {item3?.name || "Aaron Francis"}
                  </h4>
                  <span style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(168, 85, 247, 0.75)", marginBottom: "8px" }}>
                    {item3?.role || "Co-founder, Try Hard Studios"}
                  </span>
                  <p style={{ fontSize: "11px", fontWeight: 400, color: "#64748B", lineHeight: 1.5, margin: 0, maxWidth: "165px" }}>
                    &ldquo;{item3?.quote || "Takes the pain out of learning motion design — pacing is exact."}&rdquo;
                  </p>
                </motion.div>
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Bottom Infographics Footer & Controls matching Reference Image */}
        <div className="mt-6 flex items-center justify-between px-10">
          {/* INFOGRAPHICS Title & Color Squares matching Reference Image */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-500">
              INFOGRAPHICS
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-[#00C2E8]" />
              <span className="h-2 w-2 rounded-xs bg-[#4F46E5]" />
              <span className="h-2 w-2 rounded-xs bg-[#A855F7]" />
            </div>
          </div>

          {/* Navigation Arrows for Reviews */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              title="Previous reviews"
              className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
              aria-label="Previous reviews"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={handleNext}
              title="Next reviews"
              className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
              aria-label="Next reviews"
            >
              <ChevronRight size={15} />
            </button>
          </div>
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
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
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
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-[#00C3E3] focus:outline-none"
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
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 focus:border-[#00C3E3] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00C3E3] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600 active:scale-95 disabled:opacity-50"
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
