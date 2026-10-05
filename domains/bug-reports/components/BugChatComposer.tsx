'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Lock, MessageSquare, Send } from 'lucide-react';

const MAX_LENGTH = 4000;
const MAX_HEIGHT = 180;

/**
 * The message box under a report's conversation. One card: a growing textarea, an optional
 * reply / internal-note switch (staff only), an optional screenshot button, and send. Enter adds a
 * line; Ctrl/⌘+Enter sends. Clears itself only after `onSend` resolves to true.
 */
export function BugChatComposer({
  onSend,
  onAttach,
  allowInternal = false,
  placeholder,
  disabled = false,
}: {
  onSend: (body: string, internal: boolean) => Promise<boolean>;
  onAttach?: (file: File) => Promise<void>;
  /** Staff composer: show the Reply / Internal note switch. */
  allowInternal?: boolean;
  placeholder?: { reply: string; internal?: string };
  disabled?: boolean;
}) {
  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState<null | 'send' | 'attach'>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [body]);

  const send = async () => {
    const text = body.trim();
    if (!text || busy) return;
    setBusy('send');
    try {
      if (await onSend(text, allowInternal && internal)) setBody('');
    } finally {
      setBusy(null);
      textRef.current?.focus();
    }
  };

  const asInternal = allowInternal && internal;
  const near = body.length > MAX_LENGTH * 0.9;

  return (
    <div className="space-y-2">
      {allowInternal && (
        <div role="tablist" aria-label="Message type" className="inline-flex gap-0.5 rounded-full bg-slate-100 p-0.5 text-[11.5px] font-semibold">
          <button
            type="button"
            role="tab"
            aria-selected={!internal}
            onClick={() => setInternal(false)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 transition ${
              !internal ? 'bg-surface text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={11} /> Reply to reporter
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={internal}
            onClick={() => setInternal(true)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 transition ${
              internal ? 'bg-amber-100 text-amber-900 shadow-xs dark:bg-amber-500/20 dark:text-amber-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock size={11} /> Internal note
          </button>
        </div>
      )}

      <div
        className={`rounded-2xl border transition focus-within:ring-2 ${
          asInternal
            ? 'border-amber-300 bg-amber-50/70 focus-within:ring-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:focus-within:ring-amber-500/25'
            : 'border-slate-200 bg-surface focus-within:border-indigo-300 focus-within:ring-indigo-100 dark:focus-within:border-indigo-500/40 dark:focus-within:ring-indigo-500/25'
        }`}
      >
        <textarea
          ref={textRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          aria-label={asInternal ? 'Internal note' : 'Message'}
          placeholder={asInternal ? placeholder?.internal ?? 'Only staff will see this…' : placeholder?.reply ?? 'Write a message…'}
          className="block min-h-[44px] w-full resize-none bg-transparent px-3.5 pb-1 pt-3 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          {onAttach && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy !== null || disabled}
                aria-label="Add a screenshot"
                title="Add a screenshot"
                className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                {busy === 'attach' ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  setBusy('attach');
                  try {
                    await onAttach(file);
                  } finally {
                    setBusy(null);
                  }
                }}
              />
            </>
          )}
          <span className="ml-1 hidden text-[10.5px] text-slate-400 sm:inline">
            {asInternal ? 'Staff only · ' : allowInternal ? 'Reporter is notified · ' : ''}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-sans text-[10px]">Ctrl</kbd>+
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-sans text-[10px]">Enter</kbd> to send
          </span>
          {near && (
            <span className="ml-auto text-[10.5px] tabular-nums text-amber-600 dark:text-amber-400">
              {body.length}/{MAX_LENGTH}
            </span>
          )}
          <button
            type="button"
            onClick={send}
            disabled={!body.trim() || busy !== null || disabled}
            aria-label={asInternal ? 'Add internal note' : 'Send'}
            className={`${near ? '' : 'ml-auto'} inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              asInternal ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-ink text-on-ink hover:bg-ink-hover'
            }`}
          >
            {busy === 'send' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {asInternal ? 'Add note' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
