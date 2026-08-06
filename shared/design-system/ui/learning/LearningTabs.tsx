import React, { useState } from "react"

export interface LearningTabItem {
  id: string
  label: string
  content: React.ReactNode
}

export interface LearningTabsProps {
  tabs: LearningTabItem[]
  defaultTab?: string
}

export function LearningTabs({ tabs, defaultTab }: LearningTabsProps) {
  const [activeTabId, setActiveTabId] = useState<string>(defaultTab || tabs[0]?.id)

  const activeTabContent = tabs.find((t) => t.id === activeTabId)?.content

  return (
    <div>
      {/* Segmented tab control */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-line bg-paper p-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTabId(t.id)}
              aria-pressed={activeTabId === t.id}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors sm:px-5 ${
                activeTabId === t.id ? "bg-ink text-paper" : "text-subtle hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div key={activeTabId} className="arcade-fade mt-10">
        {activeTabContent}
      </div>
    </div>
  )
}
