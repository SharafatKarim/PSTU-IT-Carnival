import { notFound } from 'next/navigation';
import AnnouncedEvent from '@/components/events/AnnouncedEvent';
import EventDetail from '@/components/events/EventDetail';
import { getEventDetail } from '@/data/events';
import { eventMetadata } from '@/lib/metadata';

const SLUG = 'app-challenge';

export const metadata = eventMetadata(SLUG);

export default function AppChallengePage() {
  const event = getEventDetail(SLUG);
  if (!event) notFound();

  return event.stage === 'announced' ? (
    <AnnouncedEvent slug={SLUG} />
  ) : (
    <EventDetail slug={SLUG} />
  );
}
