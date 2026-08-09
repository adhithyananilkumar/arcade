// app/(authenticated)/studio/workshop/[id]/edit/page.tsx
import type { Metadata } from "next";
import { SharedContentEditorOrchestrator } from "@/apps/creator/shared/content-editor/SharedContentEditorOrchestrator";

export const metadata: Metadata = {
  title: "Edit Workshop — Arcade",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditWorkshopPage({ params }: Props) {
  const { id } = await params;

  return (
    // Removes negative margins since the global layout doesn't use padding anymore.
    // Ensure height works within the new flex layout.
    <div className="flex flex-col flex-1 bg-white">
      <SharedContentEditorOrchestrator contentId={id} contentType="workshop" />
    </div>
  );
}
