import { notFound } from 'next/navigation';
import RegistrationForm from '../../../../components/RegistrationForm';
import { getEventDetail } from '../../../../data/events';
import { REGISTRABLE_EVENTS } from '../../../../lib/routes';

/* Only events that own a form get a /register child route. */
export function generateStaticParams() {
  return REGISTRABLE_EVENTS.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = getEventDetail(slug);
  if (!event) return { title: 'Registration not found — PSTU IT Carnival 2026' };

  const title = `${event.name} Pre-Registration — PSTU IT Carnival 2026`;
  const description = `Pre-register your team for ${event.fullName} at PSTU IT Carnival 2026. ${event.tournament.teamSize}, held ${event.tournament.date} at ${event.tournament.venue}.`;

  return { title, description, openGraph: { title, description, type: 'website' } };
}

export default async function EventRegisterPage({ params }) {
  const { slug } = await params;
  const event = getEventDetail(slug);

  if (!event || event.registration?.kind !== 'form' || !event.registrationOpen) {
    notFound();
  }

  return <RegistrationForm slug={slug} />;
}
