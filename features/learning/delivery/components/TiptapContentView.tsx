// features/learning/delivery/components/TiptapContentView.tsx
// Read-only JSON -> React renderer for any Tiptap-authored content body (lesson, article,
// workshop session, webinar notes, ...). Deliberately does NOT load Tiptap — the renderer only
// ever consumes the structured JSON contract (types/editor.ts), per the platform architecture's
// "delivery never loads Tiptap" rule. Content-type-agnostic on purpose — see
// docs/render-engine-future-work.md for how upcoming content types (Article/Workshop/Webinar)
// are expected to plug into this same component.

import type { CSSProperties, JSX, ReactNode } from "react";
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
      case "highlight": {
        const color = typeof mark.attrs?.color === "string" ? mark.attrs.color : undefined;
        return (
          <mark
            key={key}
            style={color ? { backgroundColor: color } : undefined}
            className={color ? undefined : "rounded bg-yellow-200/70 px-0.5"}
          >
            {acc}
          </mark>
        );
      }
      case "subscript":
        return <sub key={key}>{acc}</sub>;
      case "superscript":
        return <sup key={key}>{acc}</sup>;
      case "textStyle": {
        const style: CSSProperties = {};
        if (typeof mark.attrs?.color === "string") style.color = mark.attrs.color;
        if (typeof mark.attrs?.backgroundColor === "string") style.backgroundColor = mark.attrs.backgroundColor;
        if (typeof mark.attrs?.fontFamily === "string") style.fontFamily = mark.attrs.fontFamily;
        if (typeof mark.attrs?.lineHeight === "string") style.lineHeight = mark.attrs.lineHeight;
        if (Object.keys(style).length === 0) return acc;
        return (
          <span key={key} style={style}>
            {acc}
          </span>
        );
      }
      default:
        return acc;
    }
  }, text);
}

/** Maps the `textAlign` attr (extension-text-align) to a Tailwind class. */
function textAlignClass(attrs: Record<string, unknown> | undefined): string {
  const align = typeof attrs?.textAlign === "string" ? attrs.textAlign : undefined;
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  if (align === "justify") return "text-justify";
  return "";
}

function renderNode(node: TiptapNode, key: number): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i)) ?? null;

  switch (node.type) {
    case "text":
      return <span key={key}>{renderMarks(node.text ?? "", node.marks, key)}</span>;

    case "paragraph":
      return (
        <p key={key} className={`mb-4 leading-relaxed text-gray-800 ${textAlignClass(node.attrs)}`}>
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
        <Tag
          key={key}
          className={`text-gray-900 ${sizes[level] ?? sizes[2]} ${textAlignClass(node.attrs)}`}
        >
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

    case "taskList":
      return (
        <ul key={key} className="mb-4 space-y-1.5 pl-1 text-gray-800">
          {children}
        </ul>
      );

    case "taskItem": {
      const checked = node.attrs?.checked === true;
      return (
        <li key={key} className="flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={checked}
            disabled
            readOnly
            className="mt-1 h-3.5 w-3.5 flex-shrink-0 accent-indigo-600"
          />
          <div className={`leading-relaxed ${checked ? "text-gray-400 line-through" : ""}`}>
            {children}
          </div>
        </li>
      );
    }

    case "table":
      return (
        <div key={key} className="mb-4 overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-sm">
            <tbody>{children}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={key}>{children}</tr>;

    case "tableHeader":
      return (
        <th
          key={key}
          colSpan={typeof node.attrs?.colspan === "number" ? node.attrs.colspan : undefined}
          rowSpan={typeof node.attrs?.rowspan === "number" ? node.attrs.rowspan : undefined}
          className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900"
        >
          {children}
        </th>
      );

    case "tableCell":
      return (
        <td
          key={key}
          colSpan={typeof node.attrs?.colspan === "number" ? node.attrs.colspan : undefined}
          rowSpan={typeof node.attrs?.rowspan === "number" ? node.attrs.rowspan : undefined}
          className="border border-gray-200 px-3 py-2 align-top text-gray-800"
        >
          {children}
        </td>
      );

    case "youtube": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : undefined;
      if (!src) return null;
      const width = typeof node.attrs?.width === "number" ? node.attrs.width : undefined;
      const height = typeof node.attrs?.height === "number" ? node.attrs.height : undefined;
      return (
        <div key={key} className="mb-4 aspect-video w-full max-w-3xl overflow-hidden rounded-lg bg-black">
          <iframe
            src={src}
            width={width}
            height={height}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      );
    }

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
