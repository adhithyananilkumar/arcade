// apps/creator/components/DebouncedTitleInput.tsx
// Text input that owns its own keystroke state and only notifies the host after the
// user pauses (or blurs/leaves).
//
// Why: the course and lesson title fields used to write straight into the orchestrator's
// state on every keystroke. That re-rendered a ~1,500-line component — sidebar tree,
// editor subtree and all — once per character. Keeping the hot state local means typing
// a title re-renders this input alone.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DebouncedTitleInputProps {
  /** Host-owned value. Adopted when it changes identity (e.g. switching lessons). */
  value: string;
  /** Called after the user pauses typing, and immediately on blur. */
  onCommit: (value: string) => void;
  /** Milliseconds of inactivity before committing. */
  delay?: number;
  placeholder?: string;
  className?: string;
  /** Renders `size` on the input — used by the auto-width course title field. */
  autoSize?: boolean;
  minSize?: number;
}

export function DebouncedTitleInput({
  value,
  onCommit,
  delay = 400,
  placeholder,
  className,
  autoSize = false,
  minSize = 12,
}: DebouncedTitleInputProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest pending text, kept for the unmount flush below. Written only from event
  // handlers, never during render.
  const pending = useRef(value);
  const onCommitRef = useRef(onCommit);
  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  // Adopt host changes that didn't originate here (lesson switch, initial load).
  // React's "adjust state when a prop changes" pattern — done during render rather
  // than in an effect so there's no extra commit and no flash of the old title.
  const [adoptedValue, setAdoptedValue] = useState(value);
  if (value !== adoptedValue) {
    setAdoptedValue(value);
    setLocal(value);
  }

  // Mirror the live text into a ref for the unmount flush. Done in an effect so the
  // ref is never written during render.
  useEffect(() => {
    pending.current = local;
  }, [local]);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Commit whatever is pending when the field goes away, so a title typed right
  // before navigating isn't dropped.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        onCommitRef.current(pending.current);
      }
    },
    []
  );

  const handleChange = useCallback(
    (next: string) => {
      setLocal(next);
      pending.current = next;
      clear();
      timer.current = setTimeout(() => {
        timer.current = null;
        onCommitRef.current(next);
      }, delay);
    },
    [delay]
  );

  return (
    <input
      type="text"
      value={local}
      placeholder={placeholder}
      className={className}
      {...(autoSize ? { size: Math.max(local.length, minSize) } : {})}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => {
        clear();
        onCommitRef.current(pending.current);
      }}
    />
  );
}
