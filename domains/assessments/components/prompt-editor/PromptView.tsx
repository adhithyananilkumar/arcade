"use client";

// domains/assessments/components/prompt-editor/PromptView.tsx
// Read-only renderer for a question prompt's Tiptap document. Deliberately NOT
// domains/learning/delivery/components/TiptapContentView.tsx — that renderer is wired to the
// content engine's full block registry (quiz/exam/roadmap/etc custom nodes), which would
// reintroduce the exact content-engine coupling this feature is meant to avoid. This renders
// only the small, fixed node/mark set QuestionPromptEditor actually produces.

import "katex/dist/katex.min.css";
import katex from "katex";
import type { ReactNode } from "react";
import type { TiptapDocument, TiptapMark, TiptapNode } from "@/shared/types/editor.types";

function renderMarks(text: string, marks: TiptapMark[] | undefined, key: number): ReactNode {
  let node: ReactNode = text;
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        node = <strong key={key}>{node}</strong>;
        break;
      case "italic":
        node = <em key={key}>{node}</em>;
        break;
      case "underline":
        node = <u key={key}>{node}</u>;
        break;
      case "strike":
        node = <s key={key}>{node}</s>;
        break;
      case "code":
        node = (
          <code key={key} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em]">
            {node}
          </code>
        );
        break;
      case "link":
        node = (
          <a
            key={key}
            href={(mark.attrs?.href as string) ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline decoration-indigo-300 underline-offset-2"
          >
            {node}
          </a>
        );
        break;
    }
  }
  return node;
}

function InlineMath({ latex }: { latex: string }) {
  let html = "";
  try {
    html = katex.renderToString(latex, { throwOnError: false });
  } catch {
    html = latex;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderInline(nodes: TiptapNode[] | undefined): ReactNode[] {
  return (nodes ?? []).map((n, i) => {
    if (n.type === "text") return <span key={i}>{renderMarks(n.text ?? "", n.marks, i)}</span>;
    if (n.type === "inlineMath" || n.type === "blockMath") {
      const latex = (n.attrs?.latex as string) ?? "";
      return <InlineMath key={i} latex={latex} />;
    }
    if (n.type === "hardBreak") return <br key={i} />;
    return null;
  });
}

function renderBlock(node: TiptapNode, key: number): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="my-1 text-sm leading-relaxed text-gray-800">
          {renderInline(node.content)}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      const sizes: Record<number, string> = {
        1: "text-lg font-bold",
        2: "text-base font-bold",
        3: "text-sm font-bold",
      };
      return (
        <p key={key} className={`my-2 text-gray-900 ${sizes[level] ?? sizes[3]}`}>
          {renderInline(node.content)}
        </p>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="my-1 list-disc space-y-0.5 pl-5 text-sm text-gray-800">
          {(node.content ?? []).map((li, i) => (
            <li key={i}>{(li.content ?? []).map((c, j) => renderBlock(c, j))}</li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="my-1 list-decimal space-y-0.5 pl-5 text-sm text-gray-800">
          {(node.content ?? []).map((li, i) => (
            <li key={i}>{(li.content ?? []).map((c, j) => renderBlock(c, j))}</li>
          ))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote key={key} className="my-2 border-l-2 border-indigo-200 pl-3 text-sm text-gray-600">
          {(node.content ?? []).map((c, i) => renderBlock(c, i))}
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre
          key={key}
          className="my-2 overflow-x-auto rounded-lg bg-gray-900 px-3 py-2 text-xs text-gray-100"
        >
          <code>{(node.content ?? []).map((c) => c.text ?? "").join("")}</code>
        </pre>
      );
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={node.attrs?.src as string}
          alt={(node.attrs?.alt as string) ?? ""}
          className="my-2 max-w-full rounded-lg"
        />
      );
    case "blockMath": {
      const latex = (node.attrs?.latex as string) ?? "";
      let html = "";
      try {
        html = katex.renderToString(latex, { throwOnError: false, displayMode: true });
      } catch {
        html = latex;
      }
      return <div key={key} className="my-2" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    default:
      return null;
  }
}

export function PromptView({ doc, className = "" }: { doc: TiptapDocument; className?: string }) {
  return <div className={className}>{(doc.content ?? []).map((n, i) => renderBlock(n, i))}</div>;
}
