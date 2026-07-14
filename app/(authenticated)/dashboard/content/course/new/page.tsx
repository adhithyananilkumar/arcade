// app/(authenticated)/dashboard/content/course/new/page.tsx
// Courses are created via the dashboard "Create Content" modal, then opened at
// /course/{id}/edit. Any direct hit here just returns to the dashboard.
import { redirect } from "next/navigation";

export default function NewCoursePage() {
  redirect("/dashboard");
}
