import { notFound } from 'next/navigation';
import SlotAllocations from '@/components/events/SlotAllocations';
import { getEventDetail } from '@/data/events';
import { eventSlotsMetadata } from '@/lib/metadata';

const SLUG = 'iupc';

export const metadata = eventSlotsMetadata(SLUG);

export default function IupcSlotsPage() {
  if (!getEventDetail(SLUG)) notFound();

  return <SlotAllocations slug={SLUG} />;
}
