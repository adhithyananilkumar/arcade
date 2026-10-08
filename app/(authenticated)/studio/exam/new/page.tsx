// app/(authenticated)/studio/exam/new/page.tsx
// Exams are created in the Studio dashboard's "Create Content" dialog, like courses and events.
// A direct hit here (an old link or bookmark) opens that same dialog.
import { redirect } from "next/navigation";

export default function NewExamPage() {
  redirect("/studio?create=exam");
}
