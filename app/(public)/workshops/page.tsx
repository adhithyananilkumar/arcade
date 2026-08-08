import { Metadata } from 'next';
import WorkshopDiscoveryPage from '@/apps/public/components/explore/WorkshopDiscoveryPage';

export const metadata: Metadata = {
  title: 'Workshop Discovery | Arcade',
  description: 'Discover live workshops, bootcamps, and masterclasses on Arcade.',
};

export default function WorkshopsPage() {
  return <WorkshopDiscoveryPage />;
}
