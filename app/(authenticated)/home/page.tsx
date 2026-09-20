// Rewrite target for authenticated requests to "/" (see middleware.ts). The URL bar
// keeps showing "/" — this route segment is never user-visible or linked to directly.
import LearnerHomePage from "@/apps/learner/components/home/LearnerHomePage";

export default function AuthenticatedHomePage() {
  return <LearnerHomePage />;
}
