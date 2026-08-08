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
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsOpen(true)
  }

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setIsOpen(false), 180)
  }

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("mousedown", onDown)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="relative inline-block text-left"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <div
        onClick={() => setIsOpen((v) => !v)}
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
  danger?: boolean
}

export function MenuItem({
  children,
  onClick,
  disabled = false,
  icon,
  isActive = false,
  danger = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      className={`relative flex h-full w-full items-center justify-between gap-3 whitespace-nowrap rounded-full px-4
        ${disabled ? "cursor-not-allowed text-slate-300" : danger ? "text-rose-600" : "text-[#14142b]"}
        ${isActive ? "bg-black/[0.03]" : ""}
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      {children && <span className="text-sm font-semibold tracking-tight">{children}</span>}
      {icon && (
        <span className="flex shrink-0 transition-transform duration-300 group-hover:scale-110 [&_svg]:size-[17px]">
          {icon}
        </span>
      )}
    </button>
  )
}

const ITEM_GAP = 52
const EXPAND_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const COLLAPSE_EASE = "cubic-bezier(0.4, 0, 0.2, 1)"

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const childrenArray = React.Children.toArray(children)
  const totalItems = childrenArray.length - 1

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsExpanded(true)
  }

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setIsExpanded(false), 200)
  }

  const close = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsExpanded(false)
  }

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close()
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("mousedown", onDown)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  // Fixed layout height — pills overlay below, never push notifications / title bars
  const overlayHeight = totalItems * ITEM_GAP + 14

  return (
    <div
      ref={containerRef}
      className="relative h-12 w-[158px]"
      data-expanded={isExpanded}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      {/* Invisible hover bridge over the dropped pills (no layout shift) */}
      {isExpanded && (
        <div
          aria-hidden
          className="absolute left-0 right-0 top-0 z-40"
          style={{ height: 48 + overlayHeight }}
        />
      )}

      <div className="relative z-50 h-12 w-full">
        {/* Trigger — always on top */}
        <button
          type="button"
          className={`absolute inset-x-0 top-0 z-[60] flex h-12 w-full items-center justify-between overflow-hidden rounded-full border bg-white px-1.5 pl-3 shadow-[0_4px_14px_rgba(20,20,43,0.1)] transition-all duration-300 will-change-transform group ${
            isExpanded
              ? "border-slate-300 shadow-[0_6px_18px_rgba(20,20,43,0.14)]"
              : "border-slate-200/90 hover:border-slate-300 active:scale-[0.98]"
          }`}
          onClick={() => setIsExpanded((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={isExpanded}
        >
          {childrenArray[0]}
        </button>

        {/* Cascading pills — absolute overlay only */}
        {childrenArray.slice(1).map((child, index) => {
          const delayExpand = index * 55
          const delayCollapse = (totalItems - index - 1) * 40
          const delay = isExpanded ? delayExpand : delayCollapse
          const ease = isExpanded ? EXPAND_EASE : COLLAPSE_EASE
          const duration = isExpanded ? 520 : 380

          return (
            <div
              key={index}
              className="absolute left-0 right-0 top-0 will-change-transform"
              style={{
                height: 48,
                transform: `translate3d(0, ${isExpanded ? (index + 1) * ITEM_GAP + 6 : 0}px, 0) scale(${
                  isExpanded ? 1 : 0.92
                })`,
                opacity: isExpanded ? 1 : 0,
                zIndex: 55 - index,
                pointerEvents: isExpanded ? "auto" : "none",
                transition: `transform ${duration}ms ${ease} ${delay}ms, opacity ${
                  isExpanded ? 280 : 220
                }ms ease ${delay}ms`,
                backfaceVisibility: "hidden",
              }}
            >
              <div
                className="group flex h-full w-full items-center rounded-full border border-slate-200/90 bg-white shadow-[0_4px_14px_rgba(20,20,43,0.08)] transition-[transform,box-shadow,border-color] duration-300 hover:z-50 hover:scale-[1.03] hover:border-slate-300 hover:shadow-[0_8px_22px_rgba(20,20,43,0.12)]"
                onClick={close}
              >
                {child}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
