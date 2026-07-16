"use client"

import React, { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()
  
  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

  const childrenArray = React.Children.toArray(children)
  const totalItems = childrenArray.length - 1

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="relative w-[150px] h-[48px]" data-expanded={isExpanded}>
      {/* Container for all items */}
      <div className="relative w-full h-full">
        {/* First item - always visible (Trigger) */}
        <div 
          className="absolute z-50 w-full h-full bg-white dark:bg-black shadow-[0_4px_12px_rgba(0,0,0,0.1)] cursor-pointer rounded-full group will-change-transform flex items-center justify-between px-1.5 overflow-hidden border border-slate-200 dark:border-neutral-800 transition-all hover:border-indigo-500 active:scale-95"
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>

        {/* Other items */}
        {childrenArray.slice(1).map((child, index) => {
          const delayExpand = index * 50;
          const delayCollapse = (totalItems - index - 1) * 50;
          const delay = isExpanded ? delayExpand : delayCollapse;

          return (
            <div 
              key={index} 
              className="absolute top-0 right-0 w-full h-full will-change-transform"
              style={{
                transform: `translateY(${isExpanded ? (index + 1) * 56 + 8 : 0}px)`,
                opacity: isExpanded ? 1 : 0,
                zIndex: 40 - index,
                pointerEvents: isExpanded ? "auto" : "none",
                transition: `transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms,
                           opacity 300ms ease ${delay}ms`,
                backfaceVisibility: 'hidden',
                perspective: 1000,
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              <div className="h-full w-full bg-white dark:bg-black shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-neutral-800 rounded-full flex items-center justify-center hover:scale-[1.05] transition-transform duration-300 group">
                {child}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
