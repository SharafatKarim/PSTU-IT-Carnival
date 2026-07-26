import { notFound } from 'next/navigation';
import EventDetail from '@/components/events/EventDetail';
import { getEventDetail } from '@/data/events';
import { eventMetadata } from '@/lib/metadata';

const SLUG = 'iupc';

export const metadata = eventMetadata(SLUG);

export default function IupcPage() {
  // The detail component looks the event up itself, matching the game routes.
  if (!getEventDetail(SLUG)) notFound();

  return <EventDetail slug={SLUG} />;
}
