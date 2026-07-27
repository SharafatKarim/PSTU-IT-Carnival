import { notFound } from 'next/navigation';
import DatathonRegistrationForm from '@/components/DatathonRegistrationForm';
import { getEventDetail } from '@/data/events';
import { eventRegisterMetadata } from '@/lib/metadata';

const SLUG = 'datathon';

export const metadata = eventRegisterMetadata(SLUG);

export default function DatathonRegisterPage() {
  const event = getEventDetail(SLUG);

  if (!event || event.registration?.kind !== 'form' || !event.registrationOpen) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <main className="pb-16 pt-8">
        <DatathonRegistrationForm />
      </main>
    </div>
  );
}
