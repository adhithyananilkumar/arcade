// apps/creator/editor/lib/exportPdf.ts
// PDF export via the browser's native print pipeline ("Save as PDF" in the print
// dialog) rather than jsPDF/html-to-image rasterization, which tends to produce
// blurry, badly-paginated output for long documents.

import ReactDOMServer from "react-dom/server";
import { createElement } from "react";
import { TiptapContentView } from "@/domains/learning";
import type { TiptapDocument } from "@/shared/types/editor.types";

export function exportToPdf(doc: TiptapDocument, title = "Untitled") {
  const html = ReactDOMServer.renderToStaticMarkup(
    createElement(TiptapContentView, { body: JSON.stringify(doc) })
  );

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.alert("Pop-up blocked — allow pop-ups to export as PDF.");
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 2.5rem; max-width: 800px; margin: 0 auto; }
      img { max-width: 100%; }
      table { border-collapse: collapse; width: 100%; }
      td, th { border: 1px solid #e5e7eb; padding: 6px 10px; }
    </style>
  </head>
  <body>${html}</body>
</html>`);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
