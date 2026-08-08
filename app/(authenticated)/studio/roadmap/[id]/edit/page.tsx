"use client";

import { use } from "react";
import { SharedContentEditorOrchestrator } from "@/apps/creator/shared/content-editor/SharedContentEditorOrchestrator";

export default function RoadmapEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
console.log('RoadmapEditPage mounted');


  return (
    <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
      <SharedContentEditorOrchestrator contentType="roadmap" contentId={id} />
    </div>
  );
}
