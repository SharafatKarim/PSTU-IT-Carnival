import { notFound } from 'next/navigation';
import TeamsDirectory from '@/components/events/TeamsDirectory';
import { getEventDetail } from '@/data/events';
import { eventTeamsMetadata } from '@/lib/metadata';

const SLUG = 'iupc';

export const metadata = eventTeamsMetadata(SLUG);

export default function IupcTeamsPage() {
  if (!getEventDetail(SLUG)) notFound();

  return <TeamsDirectory slug={SLUG} />;
}
