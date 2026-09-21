import React from "react"
import Link from "next/link"
import { ChevronRight, Clock, BookOpen, Users, Radio, Play, Volume2, Settings, Share2, Heart, Flag } from "lucide-react"
import { FlowerMark, Avatar } from "./LearningDecorations"
import { formatMoney } from "../../../utils/money"
import type { CourseChannelSummary, CourseCollaboratorSummary } from "../../../types/api.types"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function LearningBreadcrumb({ items, title }: { items: BreadcrumbItem[]; title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {c.href ? (
              <Link
                href={c.href}
                className="rounded-full px-2.5 py-1 font-medium text-subtle transition-colors hover:bg-mist hover:text-ink"
              >
                {c.label}
              </Link>
            ) : (
              <span className="rounded-full px-2.5 py-1 font-medium text-subtle">
                {c.label}
              </span>
            )}
            <ChevronRight size={13} className="text-subtle/40" />
          </li>
        ))}
        <li className="rounded-full bg-ink/[0.04] px-2.5 py-1 font-semibold text-ink">{title}</li>
      </ol>
    </nav>
  )
}

export interface LearningMetaChip {
  icon: React.ElementType
  label: React.ReactNode
  dotColor?: string
}

export interface LearningHeroProps {
  category?: string
  title: string
  authorName: string
  authorUsername?: string
  authorAvatarUrl?: string | null
  authorAccent?: string
  metaChips: LearningMetaChip[]
  pricingModel?: "PAID" | "FREE" | string
  priceAmount?: number | null
  currency?: string
  actionButton: React.ReactNode
  onWishlistToggle?: () => void
  isWishlisted?: boolean
  onReportClick?: () => void
  previewImageUrl?: string | null
  previewVideoDuration?: string // e.g. "0:42 / 2:00"
  onPlayPreview?: () => void
  previewLabel?: string
  previewAuthorLabel?: string
  accentColor?: string
  breadcrumbs?: BreadcrumbItem[]
  /** Owning channel. An organization channel is credited above the individual author. */
  channel?: CourseChannelSummary | null
  /** Everyone credited on the content, author included — the author is filtered out below. */
  collaborators?: CourseCollaboratorSummary[] | null
  /** The primary author's id, used to exclude them from the collaborator chips. */
  authorId?: string | null
}

export function LearningHero({
  category,
  title,
  authorName,
  authorUsername,
  authorAvatarUrl,
  authorAccent = "var(--color-purple)",
  metaChips,
  pricingModel,
  priceAmount,
  currency = "USD",
  actionButton,
  onWishlistToggle,
  isWishlisted = false,
  onReportClick,
  previewImageUrl,
  previewVideoDuration = "0:42 / 2:00",
  onPlayPreview,
  previewLabel = "Course preview",
  previewAuthorLabel,
  accentColor = "#4c6fff",
  breadcrumbs = [],
  channel,
  collaborators,
  authorId,
}: LearningHeroProps) {
  const words = title.split(" ")
  const lastWord = words.pop() || ""
  const firstPart = words.join(" ")

  const displayUsername = authorUsername || authorName.toLowerCase().replace(/\s+/g, "")
  const displayPreviewAuthor = previewAuthorLabel || `@${displayUsername}`

  const isOrgChannel = Boolean(channel && !channel.isPersonal && channel.name)
  const authorProfileHref = authorUsername ? `/${authorUsername}` : null

  // Filter by author id, not by username: a user with no profile username would otherwise fail
  // the comparison and appear as a collaborator on their own course. The backend also tags the
  // author's entry with role "Author", which covers the case where authorId is not supplied.
  const coAuthors = (collaborators ?? []).filter(
    (c) => (authorId ? c.id !== authorId : c.role !== "Author")
  )

  return (
    <div className="arcade-fade">
      {breadcrumbs.length > 0 && <LearningBreadcrumb items={breadcrumbs} title={title} />}
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left — editorial copy */}
        <div>
        {category && (
          <span className="inline-block px-3.5 py-1 bg-[#4c6fff]/10 text-[#4c6fff] text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            {category}
          </span>
        )}
        <h1
          className="mt-6 text-[2.75rem] font-normal leading-[1.05] tracking-tight text-ink text-balance sm:text-[4rem]"
          style={{ fontFamily: '"Clash Display", var(--font-sora), sans-serif', fontWeight: 700 }}
        >
          {firstPart}{" "}
          <span className="relative whitespace-nowrap italic text-[#4c6fff]">
            {lastWord}
            <FlowerMark
              size={26}
              color="var(--color-ink)"
              className="arcade-spin absolute -right-8 -top-2 hidden sm:block"
            />
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M2 9C40 3 160 3 198 8" stroke="var(--color-amber)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
          .
        </h1>

        {/* Instructor — an org channel is credited as the publisher, with the author beneath it;
            a personal channel is simply the author. */}
        {isOrgChannel ? (
          <div className="mt-7 flex items-center gap-3">
            <Link href={`/channels/${channel!.id}`} className="transition-opacity hover:opacity-80">
              <Avatar name={channel!.name} imageUrl={channel!.iconUrl} accent={authorAccent} size={46} />
            </Link>
            <div>
              <Link href={`/channels/${channel!.id}`} className="hover:underline">
                <p className="font-semibold text-ink">{channel!.name}</p>
              </Link>
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-subtle">
                <Radio size={14} className="opacity-70 text-blue" />
                by {authorProfileHref ? (
                  <Link href={authorProfileHref} className="hover:underline">@{displayUsername}</Link>
                ) : (
                  authorName
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-7 flex items-center gap-3">
            <Avatar name={authorName} imageUrl={authorAvatarUrl} accent={authorAccent} size={46} />
            <div>
              <p className="font-semibold text-ink">{authorName}</p>
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-subtle">
                <Radio size={14} className="opacity-70 text-blue" />
                @{displayUsername}
              </p>
            </div>
          </div>
        )}

        {/* Collaborators — only the people who are not the author, so a solo course shows
            nothing here rather than repeating the author's own name back at them. */}
        {coAuthors.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-subtle">Collaborators:</span>
            {coAuthors.map((collab) => {
              const chip = (
                <>
                  <Avatar name={collab.name} imageUrl={collab.avatarUrl} size={18} />
                  <span className="text-xs text-ink">{collab.name}</span>
                </>
              )
              return collab.username ? (
                <Link
                  key={collab.id}
                  href={`/${collab.username}`}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-0.5 transition-opacity hover:opacity-80"
                >
                  {chip}
                </Link>
              ) : (
                <span
                  key={collab.id}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-0.5"
                >
                  {chip}
                </span>
              )
            })}
          </div>
        )}

        {/* Meta Chips */}
        <div className="mt-7 flex flex-wrap gap-2.5">
          {metaChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink"
            >
              {chip.dotColor && <span className="size-1.5 rounded-full" style={{ background: chip.dotColor }} />}
              <chip.icon size={14} className="text-subtle" /> {chip.label}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-2 pr-1">
            {pricingModel === "PAID" ? (
              <span className="font-serif text-3xl font-medium text-ink">
                {priceAmount ? formatMoney(priceAmount, currency) : `$0`}
              </span>
            ) : (
              <span className="font-serif text-3xl font-medium text-ink">Free</span>
            )}
          </div>
          {actionButton}
          
          {onWishlistToggle && (
            <button
              onClick={onWishlistToggle}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              className="grid size-11 place-items-center rounded-full border border-line bg-paper text-subtle transition-colors hover:text-coral"
            >
              <Heart
                size={18}
                fill={isWishlisted ? "var(--color-coral)" : "none"}
                color={isWishlisted ? "var(--color-coral)" : "currentColor"}
              />
            </button>
          )}

          {onReportClick && (
            <button
              onClick={onReportClick}
              aria-label="Report content"
              className="grid size-11 place-items-center rounded-full border border-line bg-paper text-subtle transition-colors hover:text-red-500"
            >
              <Flag size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Right — dark video preview card */}
      <div className="relative">
        <div
          className="absolute -right-4 -top-5 hidden size-24 rounded-full opacity-70 blur-2xl lg:block"
          style={{ background: accentColor }}
          aria-hidden="true"
        />
        <div className="relative rounded-3xl bg-[#14142b] p-3.5 shadow-[0_28px_60px_rgba(20,22,28,0.28)]">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <span 
                className="grid size-8 place-items-center overflow-hidden rounded-full text-xs font-bold text-white"
                style={{ background: accentColor }}
              >
                {authorAvatarUrl ? (
                  <img src={authorAvatarUrl} alt={authorName} className="size-full object-cover" />
                ) : (
                  authorName[0]
                )}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-white">{previewLabel}</p>
                <p className="text-[11px] text-white/50">{displayPreviewAuthor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/45">
              <Volume2 size={15} />
              <Settings size={15} />
            </div>
          </div>

          <div className="relative grid h-56 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d2130] to-[#262a38]">
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            ) : (
              <div
                className="absolute -left-6 -top-6 size-24 rounded-full opacity-40 blur-2xl"
                style={{ background: "#9b5de5" }}
                aria-hidden="true"
              />
            )}
            <button
              onClick={onPlayPreview}
              aria-label="Play preview"
              className="grid size-16 place-items-center rounded-full bg-white/12 ring-1 ring-white/20 backdrop-blur-sm transition-transform hover:scale-105 z-10"
            >
              <Play size={22} className="translate-x-0.5 text-white" fill="currentColor" />
            </button>
          </div>

          <div className="mt-3.5 h-1 rounded-full bg-white/12">
            <div className="h-full w-[35%] rounded-full bg-[#ff6b4a]" />
          </div>
          <div className="mt-2.5 flex items-center justify-between px-0.5 text-[11px] text-white/50">
            <span>{previewVideoDuration}</span>
            <span className="flex items-center gap-3">
              <Share2 size={13} />
              <Clock size={13} />
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
