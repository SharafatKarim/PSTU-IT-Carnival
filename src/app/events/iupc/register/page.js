import { notFound } from 'next/navigation';
import RegistrationForm from '@/components/RegistrationForm';
import { getEventDetail } from '@/data/events';
import { eventRegisterMetadata } from '@/lib/metadata';

const SLUG = 'iupc';

export const metadata = eventRegisterMetadata(SLUG);

export default function IupcRegisterPage() {
  const event = getEventDetail(SLUG);

  if (!event || event.registration?.kind !== 'form' || !event.registrationOpen) {
    notFound();
  }

  return <RegistrationForm slug={SLUG} />;
}
