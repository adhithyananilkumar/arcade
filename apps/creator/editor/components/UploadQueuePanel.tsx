// apps/creator/editor/components/UploadQueuePanel.tsx
// Google-Docs-style floating upload tray: fixed to the bottom-right of the viewport,
// independent of the editor's own scroll container, so an in-flight upload never blocks
// the author from continuing to write. Reads apps/creator/editor/lib/uploadQueueStore.ts,
// which MediaUploadDialog enqueues into instead of uploading inline.

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, X, Check, AlertCircle, Video, Image as ImageIcon } from "lucide-react";

import { Button } from "@/shared/design-system/ui/button";
import { useUploadQueueStore, type UploadItem } from "../lib/uploadQueueStore";

function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "Uploading…";
  if (seconds < 60) return "Less than a minute left…";
  const totalMinutes = Math.ceil(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} min left…`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} hr, ${minutes} min left…` : `${hours} hr left…`;
}

/** Aggregate ETA across every in-flight item, from bytes-done / elapsed-time throughput. */
function useAggregateStatusText(items: UploadItem[]): string {
  const active = items.filter((item) => item.status === "uploading");
  const errored = items.filter((item) => item.status === "error");
  const pending = items.filter((item) => item.status === "queued" || item.status === "uploading");

  if (pending.length === 0) {
    if (errored.length > 0) return `${errored.length} upload${errored.length > 1 ? "s" : ""} failed`;
    return "Uploads complete";
  }
  if (active.length === 0) return "Starting uploads…";

  const now = Date.now();
  let bytesDone = 0;
  let bytesTotal = 0;
  let earliestStart = now;
  for (const item of pending) {
    bytesTotal += item.file.size;
    bytesDone += (item.file.size * item.progress) / 100;
    if (item.startedAt && item.startedAt < earliestStart) earliestStart = item.startedAt;
  }
  const elapsedSeconds = (now - earliestStart) / 1000;
  if (elapsedSeconds < 1.5 || bytesDone <= 0) return "Starting uploads…";

  const rate = bytesDone / elapsedSeconds; // bytes/sec
  const remaining = bytesTotal - bytesDone;
  return formatEta(remaining / rate);
}

// Google-Drive-style ring: an SVG stroke arc (not a conic-gradient fill), since a
// filled wedge reads as a solid dot at low percentages — a thin arc against a light
// track is what actually reads as "progress" at a glance.
function CircularProgress({ progress }: { progress: number }) {
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);
  return (
    <svg viewBox="0 0 18 18" className="size-[18px] -rotate-90">
      <circle cx="9" cy="9" r={radius} fill="none" stroke="var(--muted)" strokeWidth="2" />
      <circle
        cx="9"
        cy="9"
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-200 ease-linear"
      />
    </svg>
  );
}

function StatusIndicator({ item, onCancel, onRetry }: { item: UploadItem; onCancel: () => void; onRetry: () => void }) {
  if (item.status === "done") {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="size-3" strokeWidth={3} />
      </div>
    );
  }

  if (item.status === "error") {
    return (
      <Button variant="ghost" size="icon-sm" onClick={onRetry} aria-label="Retry upload" title={item.error}>
        <AlertCircle className="size-4 text-destructive" />
      </Button>
    );
  }

  if (item.status === "cancelled") {
    return <X className="size-4 text-muted-foreground" />;
  }

  // queued or uploading: progress ring by default, swaps to a cancel button on hover.
  return (
    <button
      type="button"
      onClick={onCancel}
      aria-label="Cancel upload"
      className="group/ring relative flex size-5 items-center justify-center rounded-full"
    >
      <span className="transition-opacity group-hover/ring:opacity-0">
        <CircularProgress progress={item.status === "uploading" ? item.progress : 0} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground text-background opacity-0 transition-opacity group-hover/ring:opacity-100">
        <X className="size-3" />
      </span>
    </button>
  );
}

function UploadRow({ item }: { item: UploadItem }) {
  const cancel = useUploadQueueStore((s) => s.cancel);
  const retry = useUploadQueueStore((s) => s.retry);
  const Icon = item.kind === "video" ? Video : ImageIcon;

  return (
    <div className="flex min-w-0 items-center gap-2.5 px-3 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{item.file.name}</p>
        {item.status === "error" && <p className="truncate text-xs text-destructive">{item.error}</p>}
      </div>
      <StatusIndicator item={item} onCancel={() => cancel(item.id)} onRetry={() => retry(item.id)} />
    </div>
  );
}

export function UploadQueuePanel() {
  const items = useUploadQueueStore((s) => s.items);
  const collapsed = useUploadQueueStore((s) => s.collapsed);
  const toggleCollapsed = useUploadQueueStore((s) => s.toggleCollapsed);
  const cancelAll = useUploadQueueStore((s) => s.cancelAll);
  const statusText = useAggregateStatusText(items);

  // Re-render periodically so the ETA text keeps counting down even between progress
  // events (upload progress events can be sparse for large files on a fast connection).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  // Portalled straight to <body> — a fixed-position child stays clipped to any ancestor
  // that happens to establish a new containing block (transform/filter/contain), and the
  // whole point of this panel is that it survives regardless of where the editor lives
  // on the page.
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
      <div className="flex items-center justify-between px-3 py-2.5">
        <p className="text-sm font-medium text-foreground">
          Uploading {items.length} item{items.length > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={cancelAll} aria-label="Cancel all uploads">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">{statusText}</span>
        <button
          type="button"
          onClick={cancelAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          Cancel
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-64 divide-y divide-border overflow-y-auto">
          {items.map((item) => (
            <UploadRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
