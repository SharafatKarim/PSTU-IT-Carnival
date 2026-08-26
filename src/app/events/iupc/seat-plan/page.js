import { notFound } from 'next/navigation';
import IUPCSeatPlan from '@/components/events/IUPCSeatPlan';
import { getEventDetail } from '@/data/events';
import { eventSeatPlanMetadata } from '@/lib/metadata';

const SLUG = 'iupc';

export const metadata = eventSeatPlanMetadata(SLUG);

export default function IupcSeatPlanPage() {
  if (!getEventDetail(SLUG)) notFound();

  return <IUPCSeatPlan slug={SLUG} />;
}
