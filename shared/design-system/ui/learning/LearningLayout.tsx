import React from "react"

export interface LearningLayoutProps {
  hero: React.ReactNode
  tabs?: React.ReactNode
  reviews?: React.ReactNode
  cta?: React.ReactNode
  modals?: React.ReactNode
}

export function LearningLayout({ hero, tabs, reviews, cta, modals }: LearningLayoutProps) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Hero wash */}
      <div className="arcade-wash">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-32 sm:px-8 sm:pt-36">
          {hero}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        {tabs}
        
        {reviews && (
          <div className="mt-20">
            {reviews}
          </div>
        )}
        
        {cta && (
          <div className="mt-16">
            {cta}
          </div>
        )}
      </div>

      {modals}
    </main>
  )
}
