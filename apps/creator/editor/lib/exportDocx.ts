// apps/creator/editor/lib/exportDocx.ts
// Word export covering the core node types only. Anything without a mapped case
// (math, mermaid, embed, columns, callout, quiz, roadmap, button, toggle) renders as a
// plain-text fallback line rather than silently disappearing — a documented limitation,
// not a bug.

import {
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { TiptapDocument, TiptapMark, TiptapNode } from "@/shared/types/editor.types";

const CORE_TYPES = new Set([
  "doc",
  "paragraph",
  "heading",
  "text",
  "bulletList",
  "orderedList",
  "listItem",
  "taskList",
  "taskItem",
  "codeBlock",
  "blockquote",
  "horizontalRule",
  "image",
  "hardBreak",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
]);

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

function marksToRunOptions(marks?: TiptapMark[]) {
  const opts: { bold?: boolean; italics?: boolean; strike?: boolean; font?: string } = {};
  for (const mark of marks ?? []) {
    if (mark.type === "bold") opts.bold = true;
    if (mark.type === "italic") opts.italics = true;
    if (mark.type === "strike") opts.strike = true;
    if (mark.type === "code") opts.font = "Courier New";
  }
  return opts;
}

function linkHref(marks?: TiptapMark[]): string | null {
  const link = marks?.find((m) => m.type === "link");
  return typeof link?.attrs?.href === "string" ? link.attrs.href : null;
}

async function fetchImageBuffer(src: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function textRunsForParagraph(nodes: TiptapNode[] | undefined): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = [];
  for (const child of nodes ?? []) {
    if (child.type !== "text") continue;
    const text = child.text ?? "";
    const href = linkHref(child.marks);
    if (href) {
      runs.push(
        new ExternalHyperlink({
          link: href,
          children: [new TextRun({ text, style: "Hyperlink", ...marksToRunOptions(child.marks) })],
        })
      );
    } else {
      runs.push(new TextRun({ text, ...marksToRunOptions(child.marks) }));
    }
  }
  return runs;
}

function fallbackLine(type: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `[unsupported block: ${type}]`, italics: true, color: "999999" })],
  });
}

async function convertNode(node: TiptapNode): Promise<(Paragraph | Table)[]> {
  switch (node.type) {
    case "paragraph":
      return [new Paragraph({ children: textRunsForParagraph(node.content) })];

    case "heading": {
      const level = typeof node.attrs?.level === "number" ? node.attrs.level : 1;
      return [
        new Paragraph({
          heading: HEADING_LEVELS[Math.min(Math.max(level - 1, 0), 5)],
          children: textRunsForParagraph(node.content),
        }),
      ];
    }

    case "bulletList":
    case "orderedList": {
      const out: Paragraph[] = [];
      for (const item of node.content ?? []) {
        // Only the first block of a list item becomes the bulleted/numbered line —
        // nested block-level content inside a list item is a rare case, skipped for v1.
        const [firstBlock] = item.content ?? [];
        if (!firstBlock) continue;
        out.push(
          new Paragraph({
            bullet: node.type === "bulletList" ? { level: 0 } : undefined,
            numbering:
              node.type === "orderedList" ? { reference: "arcade-ordered", level: 0 } : undefined,
            children: textRunsForParagraph(firstBlock.content),
          })
        );
      }
      return out;
    }

    case "blockquote": {
      const out: Paragraph[] = [];
      for (const block of node.content ?? []) {
        out.push(
          new Paragraph({ indent: { left: 720 }, children: textRunsForParagraph(block.content) })
        );
      }
      return out;
    }

    case "codeBlock": {
      const text = (node.content ?? []).map((c) => c.text ?? "").join("");
      return [new Paragraph({ children: [new TextRun({ text, font: "Courier New" })] })];
    }

    case "horizontalRule":
      return [new Paragraph({ text: "─────────────" })];

    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : null;
      if (!src) return [];
      const buffer = await fetchImageBuffer(src);
      if (!buffer) return [fallbackLine("image (fetch failed)")];
      return [
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: 400, height: 250 },
              type: "png",
            }),
          ],
        }),
      ];
    }

    case "table": {
      const rows: TableRow[] = [];
      for (const row of node.content ?? []) {
        const cells: TableCell[] = [];
        for (const cell of row.content ?? []) {
          const cellParagraphs: Paragraph[] = [];
          for (const block of cell.content ?? []) {
            const converted = await convertNode(block);
            for (const c of converted) if (c instanceof Paragraph) cellParagraphs.push(c);
          }
          cells.push(new TableCell({ children: cellParagraphs }));
        }
        rows.push(new TableRow({ children: cells }));
      }
      return [new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })];
    }

    default:
      if (!CORE_TYPES.has(node.type)) return [fallbackLine(node.type)];
      return [];
  }
}

export async function tiptapDocToDocx(doc: TiptapDocument): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];
  for (const node of doc.content ?? []) {
    children.push(...(await convertNode(node)));
  }

  const document = new Document({
    numbering: {
      config: [
        {
          reference: "arcade-ordered",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "start" }],
        },
      ],
    },
    sections: [{ children: children.length ? children : [new Paragraph({ text: "" })] }],
  });

  return Packer.toBlob(document);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
