// app/(authenticated)/studio/article/new/page.tsx
// Articles are created via the dashboard "Create Content" modal, then opened at
// /studio/article/{id}/edit. Any direct hit here just returns to the dashboard.
import { redirect } from "next/navigation";

export default function NewArticlePage() {
  redirect("/");
}
