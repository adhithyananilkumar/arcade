// features/content/editor/components/SlashCommandMenu.tsx
"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { BlockCommand } from "@/shared/types/editor.types";

/** Imperative surface the suggestion plugin drives for keyboard navigation. */
export interface SlashCommandMenuRef {
  /** Returns true if the key was handled (arrow/enter), false to let the editor keep it. */
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashCommandMenuProps {
  items: BlockCommand[];
  /** Provided by @tiptap/suggestion — selects an item and runs its command. */
  command: (item: BlockCommand) => void;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  function SlashCommandMenu({ items, command }, ref) {
    const [selected, setSelected] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    // Reset highlight whenever the filtered result set changes.
    useEffect(() => setSelected(0), [items]);

    // Keep the highlighted row scrolled into view.
    useLayoutEffect(() => {
      const el = listRef.current?.children[selected] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }, [selected]);

    const pick = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: (event) => {
        if (event.key === "ArrowUp") {
          setSelected((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelected((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          pick(selected);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="arcade-slash-menu">
          <div className="arcade-slash-empty">No matching blocks</div>
        </div>
      );
    }

    return (
      <div className="arcade-slash-menu" ref={listRef}>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`arcade-slash-item${index === selected ? " is-selected" : ""}`}
              // onMouseDown (not click) so the editor doesn't blur before we run.
              onMouseDown={(e) => {
                e.preventDefault();
                pick(index);
              }}
              onMouseEnter={() => setSelected(index)}
            >
              <span className="arcade-slash-icon">
                <Icon size={16} />
              </span>
              <span className="arcade-slash-text">
                <span className="arcade-slash-title">{item.title}</span>
                <span className="arcade-slash-desc">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
);
