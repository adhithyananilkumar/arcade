// app/(authenticated)/studio/events/[id]/edit/page.tsx
import type { Metadata } from "next";
import { EventWorkspace } from "@/apps/creator/studio/workspaces/event/EventWorkspace";

export const metadata: Metadata = {
  title: "Edit Event — Arcade",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;

  return (
    // No background here: the editor frame inside is `fixed inset-0` and paints its own ground.
    // Under the glass theme every `bg-surface` gets a backdrop-filter, which makes this wrapper the
    // containing block for that fixed frame — so the editor shrinks to this wrapper's height, and
    // at zero height (BUG-1061) the page shows only the wallpaper.
    <div className="flex flex-col flex-1">
      <EventWorkspace eventId={id} />
    </div>
  );
}
