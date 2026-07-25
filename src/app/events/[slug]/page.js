import { notFound } from 'next/navigation';
import EventDetail from '../../../components/events/EventDetail';
import { EVENT_DETAILS, getEventDetail } from '../../../data/events';

export function generateStaticParams() {
  return EVENT_DETAILS.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = getEventDetail(slug);
  if (!event) return { title: 'Event not found — PSTU IT Carnival 2026' };

  const title = `${event.name} — PSTU IT Carnival 2026`;
  const pool = event.tournament.prizePool
    ? ` Prize pool ${event.tournament.prizePool}.`
    : '';
  const description = `${event.fullName}. ${event.tournament.date} at ${event.tournament.venue}.${pool} Format, rules and pre-registration.`;

  return { title, description, openGraph: { title, description, type: 'website' } };
}

export default async function EventPage({ params }) {
  const { slug } = await params;
  // The detail component looks the event up itself, matching the gaming route.
  if (!getEventDetail(slug)) notFound();

  return <EventDetail slug={slug} />;
}
