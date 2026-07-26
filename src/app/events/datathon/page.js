import { notFound } from 'next/navigation';
import EventDetail from '@/components/events/EventDetail';
import { getEventDetail } from '@/data/events';
import { eventMetadata } from '@/lib/metadata';

const SLUG = 'datathon';

export const metadata = eventMetadata(SLUG);

export default function DatathonPage() {
  if (!getEventDetail(SLUG)) notFound();

  return <EventDetail slug={SLUG} />;
}
