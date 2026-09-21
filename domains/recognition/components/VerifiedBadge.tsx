'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Recognition
 *
 * Purpose:
 * Renders one granted badge, with a hover card describing what it means.
 *
 * Rules:
 * - Pure. Everything it draws comes from the `badge` prop, which the backend
 *   assembled. This component never decides that somebody is verified — the
 *   previous implementation did exactly that, inferring a tick from role-code
 *   substrings and the contents of a bio, which is why it could not be
 *   granted, revoked, or explained to the person reading it.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ProfileBadge } from '../types/badge.types';
import { BadgeIcon } from './BadgeIcon';
import './VerifiedBadge.css';

export interface VerifiedBadgeProps {
  badge: ProfileBadge;
  /** Mark size in pixels. 16-18 next to body text, 24-28 next to a profile name. */
  size?: number;
  /**
   * Suppresses the hover card. For dense lists (a staff table, a search result)
   * where a popover per row is noise; the accessible name still carries the label.
   */
  showDetailOnHover?: boolean;
  className?: string;
}

type CardAlign = 'center' | 'start' | 'end';

export function VerifiedBadge({
  badge,
  size = 18,
  showDetailOnHover = true,
  className,
}: VerifiedBadgeProps) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState<CardAlign>('center');
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const cardId = useId();

  // The card is centred under the badge by default, which overflows when the badge sits near a
  // viewport edge — common, because badges live next to a name at the very top of a profile.
  // Measured after paint rather than guessed from a breakpoint: the overflow depends on the
  // badge's position, not the screen's width.
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const halfCard = 140;
    if (rect.left < halfCard) setAlign('start');
    else if (window.innerWidth - rect.right < halfCard) setAlign('end');
    else setAlign('center');
  }, [open]);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  const accessibleName = [badge.label, badge.tenure].filter(Boolean).join(', ');
  const effectClass =
    badge.effect === 'PRISM'
      ? 'arc-badge--prism'
      : badge.effect === 'GLOW'
        ? 'arc-badge--glow'
        : '';

  return (
    <span
      ref={rootRef}
      className={`relative inline-flex ${className ?? ''}`}
      onMouseEnter={showDetailOnHover ? show : undefined}
      onMouseLeave={showDetailOnHover ? hide : undefined}
      onFocus={showDetailOnHover ? show : undefined}
      onBlur={showDetailOnHover ? hide : undefined}
    >
      <span
        className={`arc-badge ${effectClass}`}
        style={{ ['--badge-accent' as string]: badge.accentColor }}
        // Focusable so the hover card is reachable by keyboard, and labelled so a screen
        // reader announces "Arcade Team Lead, 2025-26" rather than an unnamed graphic.
        tabIndex={showDetailOnHover ? 0 : -1}
        role="img"
        aria-label={accessibleName}
        aria-describedby={open ? cardId : undefined}
      >
        <BadgeIcon
          name={badge.icon}
          className="arc-badge__mark"
          size={size}
          strokeWidth={2.2}
          fill={badge.effect === 'NONE' ? badge.accentColor : 'none'}
          color={badge.effect === 'NONE' ? '#ffffff' : badge.accentColor}
        />
      </span>

      {open && showDetailOnHover && (
        <span
          id={cardId}
          role="tooltip"
          className={`arc-badge-card ${
            align === 'start'
              ? 'arc-badge-card--start'
              : align === 'end'
                ? 'arc-badge-card--end'
                : ''
          }`}
        >
          <span className="arc-badge-card__inner block">
            <span className="flex items-center gap-2">
              <BadgeIcon
                name={badge.icon}
                size={15}
                strokeWidth={2.4}
                color={badge.accentColor}
                className="shrink-0"
              />
              <span className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-white">
                {badge.label}
              </span>
            </span>

            {badge.tenure && (
              <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                {badge.tenure}
              </span>
            )}

            {(badge.note || badge.description) && (
              <span className="mt-2 block text-[12px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
                {badge.note || badge.description}
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  );
}

export interface BadgeRowProps {
  badges: ProfileBadge[];
  size?: number;
  /** Caps how many render, with a "+N" counter for the rest. */
  max?: number;
  showDetailOnHover?: boolean;
  className?: string;
}

/**
 * The badges beside a name, in the order the backend gave them.
 *
 * Order is `displayOrder` from the badge definition and is therefore a platform decision, not a
 * client one: staff recognition deliberately outranks a verification tick, because for an Arcade
 * team member that is the more informative badge.
 */
export function BadgeRow({
  badges,
  size = 18,
  max,
  showDetailOnHover = true,
  className,
}: BadgeRowProps) {
  if (!badges?.length) return null;

  const shown = typeof max === 'number' ? badges.slice(0, max) : badges;
  const hidden = badges.length - shown.length;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      {shown.map((badge) => (
        <VerifiedBadge
          key={badge.code}
          badge={badge}
          size={size}
          showDetailOnHover={showDetailOnHover}
        />
      ))}
      {hidden > 0 && (
        <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-500">
          +{hidden}
        </span>
      )}
    </span>
  );
}
