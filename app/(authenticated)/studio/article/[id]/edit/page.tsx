"use client";

import { use } from "react";
import { SharedContentEditorOrchestrator } from "@/apps/creator/shared/content-editor/SharedContentEditorOrchestrator";

export default function ArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
      <SharedContentEditorOrchestrator contentType="article" contentId={id} />
    </div>
  );
}
