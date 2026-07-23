import LearnerShell from "@/apps/learner/layout/LearnerShell";
import LearnerHomePage from "@/apps/learner/components/home/LearnerHomePage";

export default function LearnerApp() {
  return (
    <LearnerShell>
      <LearnerHomePage />
    </LearnerShell>
  );
}
