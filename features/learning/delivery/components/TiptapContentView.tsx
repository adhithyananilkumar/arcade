// features/learning/delivery/components/TiptapContentView.tsx
// Read-only JSON -> React renderer for any Tiptap-authored content body (lesson, article,
// workshop session, webinar notes, ...). Deliberately does NOT load Tiptap — the renderer only
// ever consumes the structured JSON contract (types/editor.ts), per the platform architecture's
// "delivery never loads Tiptap" rule. Content-type-agnostic on purpose — see
// docs/render-engine-future-work.md for how upcoming content types (Article/Workshop/Webinar)
// are expected to plug into this same component.

import type { JSX, ReactNode } from "react";
import type { TiptapDocument, TiptapMark, TiptapNode } from "@/types/editor";

function renderMarks(text: string, marks: TiptapMark[] | undefined, key: number): ReactNode {
  if (!marks || marks.length === 0) return text;
  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong key={key}>{acc}</strong>;
      case "italic":
        return <em key={key}>{acc}</em>;
      case "strike":
        return <s key={key}>{acc}</s>;
      case "code":
        return (
          <code key={key} className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em]">
            {acc}
          </code>
        );
      case "link":
        return (
          <a
            key={key}
            href={typeof mark.attrs?.href === "string" ? mark.attrs.href : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: TiptapNode, key: number): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i)) ?? null;

  switch (node.type) {
    case "text":
      return <span key={key}>{renderMarks(node.text ?? "", node.marks, key)}</span>;

    case "paragraph":
      return (
        <p key={key} className="mb-4 leading-relaxed text-gray-800">
          {children}
        </p>
      );

    case "heading": {
      const level = typeof node.attrs?.level === "number" ? node.attrs.level : 2;
      const sizes: Record<number, string> = {
        1: "text-3xl font-bold mb-5 mt-8",
        2: "text-2xl font-bold mb-4 mt-7",
        3: "text-xl font-semibold mb-3 mt-6",
        4: "text-lg font-semibold mb-3 mt-5",
        5: "text-base font-semibold mb-2 mt-4",
        6: "text-sm font-semibold mb-2 mt-4",
      };
      const Tag = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements;
      return (
        <Tag key={key} className={`text-gray-900 ${sizes[level] ?? sizes[2]}`}>
          {children}
        </Tag>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className="mb-4 ml-5 list-disc space-y-1 text-gray-800">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="mb-4 ml-5 list-decimal space-y-1 text-gray-800">
          {children}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className="leading-relaxed">
          {children}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="mb-4 border-l-4 border-indigo-200 pl-4 italic text-gray-600"
        >
          {children}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre key={key} className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <code>{node.content?.map((c) => c.text).join("") ?? ""}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={key} className="my-6 border-gray-200" />;

    case "hardBreak":
      return <br key={key} />;

    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : undefined;
      if (!src) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={src} alt={alt} className="mb-4 max-w-full rounded-lg" />;
    }

    case "video-player": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : undefined;
      if (!src) return null;
      return (
        <video key={key} src={src} controls className="mb-4 w-full max-w-3xl rounded-lg bg-black" />
      );
    }

    default:
      // Unknown/authoring-only node type (e.g. roadmap) — render children if any, else skip.
      return children ? <div key={key}>{children}</div> : null;
  }
}

export function TiptapContentView({
  body,
  emptyMessage = "There's no content here yet.",
}: {
  body?: string | null;
  emptyMessage?: string;
}) {
  if (!body) {
    return <p className="text-sm text-gray-400 italic">{emptyMessage}</p>;
  }

  let doc: TiptapDocument;
  try {
    doc = JSON.parse(body) as TiptapDocument;
  } catch {
    return <p className="text-sm text-red-500">This content could not be displayed.</p>;
  }

  if (!doc?.content) return null;

  return <div className="prose-sm max-w-none">{doc.content.map((node, i) => renderNode(node, i))}</div>;
}
