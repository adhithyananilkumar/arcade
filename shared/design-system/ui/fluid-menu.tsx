"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface MenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  showChevron?: boolean
}

export function Menu({ trigger, children, align = "left", showChevron = true }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <ChevronDown className="ml-2 -mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-9 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
}

export function MenuItem({ children, onClick, disabled = false, icon, isActive = false }: MenuItemProps) {
  return (
    <button
      className={`relative h-full w-full flex items-center justify-between gap-3 px-5 rounded-full whitespace-nowrap
        ${disabled ? "text-gray-400 dark:text-gray-500 cursor-not-allowed" : "text-gray-700 dark:text-gray-200"}
        ${isActive ? "bg-white/10" : ""}
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      {children && (
        <span className="text-sm font-semibold">
          {children}
        </span>
      )}
      {icon && (
        <span className="flex-shrink-0 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5]">
          {icon}
        </span>
      )}
    </button>
  )
}

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)
  const totalItems = childrenArray.length - 1

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="relative w-[170px] h-[44px]" data-expanded={isExpanded}>
      {/* Backdrop overlay to close when clicking outside */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-30 cursor-default" 
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Container for all items */}
      <div className="relative w-full h-full">
        {/* First item - always visible (Trigger) */}
        <div 
          className={`absolute z-50 w-full h-full bg-white dark:bg-zinc-900 shadow-md cursor-pointer rounded-full group will-change-transform flex items-center justify-between px-2 overflow-hidden border-2 transition-all active:scale-95 ${
            isExpanded 
              ? 'border-purple-600 ring-4 ring-purple-100 dark:ring-purple-950/60 shadow-purple-500/20' 
              : 'border-purple-500/70 hover:border-purple-600'
          }`}
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>

        {/* Folded items opening downwards */}
        {childrenArray.slice(1).map((child, index) => {
          const delayExpand = index * 40;
          const delayCollapse = (totalItems - index - 1) * 35;
          const delay = isExpanded ? delayExpand : delayCollapse;

          return (
            <div 
              key={index} 
              className="absolute top-0 right-0 w-full h-[44px] will-change-transform"
              style={{
                transform: `translateY(${isExpanded ? (index + 1) * 52 : 0}px) scale(${isExpanded ? 1 : 0.9})`,
                opacity: isExpanded ? 1 : 0,
                zIndex: 40 - index,
                pointerEvents: isExpanded ? "auto" : "none",
                transition: `transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms,
                           opacity 280ms ease ${delay}ms`,
                backfaceVisibility: 'hidden',
                perspective: 1000,
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              <div 
                className="h-full w-full bg-white dark:bg-zinc-900 shadow-lg border border-slate-200/90 dark:border-zinc-800 rounded-full flex items-center justify-between hover:scale-[1.03] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 group cursor-pointer"
                onClick={() => setIsExpanded(false)}
              >
                {child}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
