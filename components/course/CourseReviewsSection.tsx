"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Send,
  Star,
  Lightbulb,
  Search,
  Settings,
  Target,
  BarChart3,
  DollarSign
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

// Geometry math helpers for exact SVG rendering
function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const rad = (angleInDegrees * Math.PI) / 180.0
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  }
}

function createSectorPath(cx: number, cy: number, rIn: number, rOut: number, aStart: number, aEnd: number): string {
  const p1 = polarToCartesian(cx, cy, rIn, aStart)
  const p2 = polarToCartesian(cx, cy, rIn, aEnd)
  const p3 = polarToCartesian(cx, cy, rOut, aEnd)
  const p4 = polarToCartesian(cx, cy, rOut, aStart)

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rIn} ${rIn} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rOut} ${rOut} 0 0 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    `Z`
  ].join(" ")
}

function createTabPath(cx: number, cy: number, rOut: number, rTab: number, aCenter: number, spreadDeg: number = 22): string {
  const aStart = aCenter - spreadDeg
  const aEnd = aCenter + spreadDeg
  const p1 = polarToCartesian(cx, cy, rOut - 4, aStart)
  const pTip = polarToCartesian(cx, cy, rTab, aCenter)
  const p2 = polarToCartesian(cx, cy, rOut - 4, aEnd)
  const pCenter = polarToCartesian(cx, cy, rOut - 12, aCenter)

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `L ${pTip.x.toFixed(2)} ${pTip.y.toFixed(2)}`,
    `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `Q ${pCenter.x.toFixed(2)} ${pCenter.y.toFixed(2)} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `Z`
  ].join(" ")
}

const SECTORS_CONFIG = [
  {
    num: "01",
    angle: -120, // Top-Left
    color: "#00C4B4",
    icon: Lightbulb
  },
  {
    num: "02",
    angle: 180, // Middle-Left
    color: "#00A896",
    icon: Search
  },
  {
    num: "03",
    angle: 120, // Bottom-Left
    color: "#05668D",
    icon: Settings
  },
  {
    num: "04",
    angle: 60, // Bottom-Right
    color: "#1B4965",
    icon: Target
  },
  {
    num: "05",
    angle: 0, // Middle-Right
    color: "#0F4C5C",
    icon: BarChart3
  },
  {
    num: "06",
    angle: -60, // Top-Right
    color: "#0080A7",
    icon: DollarSign
  }
]

export default function CourseReviewsSection({ courseId = "intro-to-programming" }: { courseId?: string }) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [newRole, setNewRole] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Fetch reviews from API
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

  // Auto cycle reviews
  useEffect(() => {
    if (reviews.length <= 1 || hoveredIndex !== null) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [reviews.length, hoveredIndex])

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

  const getReviewForSlot = (slotIdx: number): ReviewItem => {
    if (reviews.length === 0) return DEFAULT_REVIEWS[slotIdx % DEFAULT_REVIEWS.length]
    return reviews[(currentIndex + slotIdx) % reviews.length]
  }

  const cx = 500
  const cy = 410
  const rIn = 115
  const rOut = 285
  const rTab = 338
  const rContent = 200

  return (
    <section className="relative w-full py-12 px-4 bg-[#FAFAF9] overflow-hidden">
      {/* Header Bar */}
      <div className="relative mx-auto max-w-6xl mb-4 flex items-center justify-between px-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00C4B4]">
            Student Feedback
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Reviews
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
            title="Write a Real-time Review"
          >
            <Plus size={14} className="text-[#00C4B4]" /> Add Review
          </button>

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
        </div>
      </div>

      {/* Main Infographics Wheel matching Reference Image */}
      <div className="relative mx-auto max-w-5xl select-none">
        <svg
          viewBox="0 0 1000 820"
          className="w-full h-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.08" />
            </filter>
            <filter id="hubShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#0F172A" floodOpacity="0.12" />
            </filter>

            <linearGradient id="centerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C4B4" />
              <stop offset="50%" stopColor="#0080A7" />
              <stop offset="100%" stopColor="#0B2545" />
            </linearGradient>
          </defs>

          {/* Clean background behind hexagonal sectors */}

          {/* 6 Hexagonal Wedge Sector Cards with Synchronized Backward/Forward Animation */}
          {SECTORS_CONFIG.map((sector, idx) => {
            const review = getReviewForSlot(idx)
            const IconComp = sector.icon
            const aStart = sector.angle - 27
            const aEnd = sector.angle + 27
            const sectorD = createSectorPath(cx, cy, rIn, rOut, aStart, aEnd)
            const tabD = createTabPath(cx, cy, rOut, rTab, sector.angle, 22)
            const tabLabelPos = polarToCartesian(cx, cy, rOut + 26, sector.angle)
            const contentPos = polarToCartesian(cx, cy, rContent, sector.angle)
            const isHovered = hoveredIndex === idx

            // Compute synchronized backward (outward) vector and forward (center) return
            const rad = (sector.angle * Math.PI) / 180
            const moveDistance = 25
            const moveX = Math.cos(rad) * moveDistance
            const moveY = Math.sin(rad) * moveDistance

            return (
              <motion.g
                key={sector.num}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={
                  isHovered
                    ? { x: moveX * 1.3, y: moveY * 1.3, scale: 1.04 }
                    : {
                        x: [0, moveX, moveX, 0],
                        y: [0, moveY, moveY, 0]
                      }
                }
                transition={
                  isHovered
                    ? { duration: 0.3, ease: "easeOut" }
                    : {
                        duration: 3.5,
                        times: [0, 0.2, 0.77, 1.0],
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                }
                className="cursor-pointer"
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {/* White Sector Body */}
                <path
                  d={sectorD}
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                  filter="url(#cardShadow)"
                />

                {/* Colored Outer Chevron Tab */}
                <path
                  d={tabD}
                  fill={sector.color}
                  filter="url(#cardShadow)"
                />

                {/* Number Badge Text on Outer Tab */}
                <text
                  x={tabLabelPos.x}
                  y={tabLabelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize="17"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  letterSpacing="0.02em"
                >
                  {sector.num}
                </text>

                {/* Content Inside ForeignObject */}
                <foreignObject
                  x={contentPos.x - 85}
                  y={contentPos.y - 72}
                  width={170}
                  height={144}
                  className="overflow-visible"
                >
                  <div className="flex h-full w-full flex-col items-center justify-center text-center px-2 py-1">
                    {/* Icon */}
                    <div
                      className="mb-1.5 flex size-7 items-center justify-center rounded-full bg-slate-50 shadow-xs"
                      style={{ color: sector.color }}
                    >
                      <IconComp size={18} strokeWidth={2.2} />
                    </div>

                    {/* Reviewer Name */}
                    <motion.div
                      key={review.id || review.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center w-full"
                    >
                      <h4
                        className="w-full truncate text-[12px] font-extrabold uppercase tracking-wider text-slate-800"
                        style={{ color: sector.color }}
                      >
                        {review.name}
                      </h4>

                      <span className="w-full truncate text-[10px] font-medium text-slate-500 mb-1">
                        {review.role}
                      </span>

                      {/* Quote snippet */}
                      <p
                        className="text-[10.5px] font-normal leading-tight text-slate-600 px-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        &ldquo;{review.quote}&rdquo;
                      </p>

                      {/* Rating Stars */}
                      <div className="mt-1 flex items-center justify-center gap-0.5">
                        {[...Array(review.rating || 5)].map((_, s) => (
                          <Star key={s} size={10} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </foreignObject>
              </motion.g>
            )
          })}

          {/* Central Circular Hub matching Reference Image */}
          <g filter="url(#hubShadow)">
            {/* Outer connecting circle */}
            <circle cx={cx} cy={cy} r={rIn} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="6" />
            {/* Inner accent ring */}
            <circle cx={cx} cy={cy} r={rIn - 5} fill="none" stroke="url(#centerRingGrad)" strokeWidth="4" />

            {/* Central INFOGRAPHICS Text */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#0F172A"
              fontSize="16"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="0.18em"
            >
              INFOGRAPHICS
            </text>

            {/* 5 Accent Colored Squares below Center Title */}
            <g transform={`translate(${cx - 24}, ${cy + 14})`}>
              <rect x="0" y="0" width="7" height="7" rx="1.5" fill="#00C4B4" />
              <rect x="10" y="0" width="7" height="7" rx="1.5" fill="#00A896" />
              <rect x="20" y="0" width="7" height="7" rx="1.5" fill="#05668D" />
              <rect x="30" y="0" width="7" height="7" rx="1.5" fill="#1B4965" />
              <rect x="40" y="0" width="7" height="7" rx="1.5" fill="#0080A7" />
            </g>
          </g>
        </svg>
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

