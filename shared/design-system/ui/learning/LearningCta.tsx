import React from "react"
import { FlowerMark } from "./LearningDecorations"

export interface LearningCtaProps {
  title: React.ReactNode
  description: string
  primaryAction: React.ReactNode
  secondaryAction?: React.ReactNode
}

export function LearningCta({
  title,
  description,
  primaryAction,
  secondaryAction = (
    <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-white/10">
      See how it works →
    </button>
  ),
}: LearningCtaProps) {
  return (
    <section className="arcade-cta-wash relative overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-16 sm:py-16">
      <FlowerMark
        size={120}
        color="rgba(255,255,255,0.06)"
        className="arcade-spin pointer-events-none absolute -right-8 -top-8"
      />
      <h2 className="mx-auto max-w-2xl font-serif text-3xl font-light leading-tight text-paper text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {primaryAction}
        {secondaryAction}
      </div>
    </section>
  )
}
