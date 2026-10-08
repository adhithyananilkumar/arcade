'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Lock, MessageSquare, SendHorizontal } from 'lucide-react';

const MAX_LENGTH = 4000;
const MAX_HEIGHT = 160;

/**
 * The message bar under a report's conversation, chat style: screenshot button, a growing text
 * box and a round send button. Staff get a Reply / Internal note switch above it. Enter sends;
 * Shift+Enter adds a line. Clears itself only after `onSend` resolves to true.
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
        <div className="flex items-center justify-between gap-2">
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
              <MessageSquare size={11} /> Reply
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
          <span className="text-[11px] text-slate-400">{asInternal ? 'Only staff will see this' : 'The reporter is notified'}</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div
          className={`flex min-w-0 flex-1 items-end gap-1 rounded-3xl border px-1.5 py-1 transition focus-within:ring-2 ${
            asInternal
              ? 'border-amber-300 bg-amber-50/70 focus-within:ring-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:focus-within:ring-amber-500/25'
              : 'border-slate-200 bg-surface focus-within:border-indigo-300 focus-within:ring-indigo-100 dark:focus-within:border-indigo-500/40 dark:focus-within:ring-indigo-500/20'
          }`}
        >
          {onAttach && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy !== null || disabled}
                aria-label="Add a screenshot"
                title="Add a screenshot"
                className="mb-0.5 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                {busy === 'attach' ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
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
          <textarea
            ref={textRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={MAX_LENGTH}
            disabled={disabled}
            aria-label={asInternal ? 'Internal note' : 'Message'}
            placeholder={asInternal ? placeholder?.internal ?? 'Only staff will see this…' : placeholder?.reply ?? 'Write a message…'}
            className={`block min-h-[36px] w-full resize-none bg-transparent py-2 text-[13.5px] leading-snug text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60 ${onAttach ? 'pl-0.5' : 'pl-2.5'} pr-2`}
          />
          {near && (
            <span className="mb-2.5 mr-1 shrink-0 text-[10.5px] tabular-nums text-amber-600 dark:text-amber-400">
              {body.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={send}
          disabled={!body.trim() || busy !== null || disabled}
          aria-label={asInternal ? 'Add internal note' : 'Send'}
          title={asInternal ? 'Add internal note (Enter)' : 'Send (Enter)'}
          className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${
            asInternal ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-ink text-on-ink hover:bg-ink-hover'
          }`}
        >
          {busy === 'send' ? <Loader2 size={17} className="animate-spin" /> : <SendHorizontal size={17} />}
        </button>
      </div>
    </div>
  );
}
