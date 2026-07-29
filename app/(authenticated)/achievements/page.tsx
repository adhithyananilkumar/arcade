import AchievementsPage from '@/apps/learner/components/achievements/AchievementsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achievements & Badges | Arcade',
  description: 'Track your learning milestones, earn badges, unlock certificates, and level up your skills on Arcade.',
};

export default function AchievementsRoute() {
  return <AchievementsPage />;
}
