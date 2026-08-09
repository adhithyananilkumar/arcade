// app/(authenticated)/studio/quiz/new/page.tsx
// Quizzes are created via the dashboard "Create Content" modal, then opened at
// /studio/quiz/{id}. Any direct hit here just returns to the dashboard.
import { redirect } from "next/navigation";

export default function NewQuizPage() {
  redirect("/studio?create=quiz");
}
