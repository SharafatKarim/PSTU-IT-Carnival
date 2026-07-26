import { notFound } from 'next/navigation';
import AnnouncedEvent from '@/components/events/AnnouncedEvent';
import EventDetail from '@/components/events/EventDetail';
import { getEventDetail } from '@/data/events';
import { eventMetadata } from '@/lib/metadata';

const SLUG = 'hackathon';

export const metadata = eventMetadata(SLUG);

export default function HackathonPage() {
  const event = getEventDetail(SLUG);
  if (!event) notFound();

  /* Swaps to the full detail page on its own once the data grows a
     tournament block and stage becomes 'published'. */
  return event.stage === 'announced' ? (
    <AnnouncedEvent slug={SLUG} />
  ) : (
    <EventDetail slug={SLUG} />
  );
}
