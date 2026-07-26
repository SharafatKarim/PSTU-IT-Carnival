import EventsIndex from '@/components/events/EventsIndex';
import { EVENT } from '@/data/content';

export const metadata = {
  title: `All Events — ${EVENT.title}`,
  description: EVENT.intro,
  openGraph: {
    title: `All Events — ${EVENT.title}`,
    description: EVENT.intro,
    type: 'website',
  },
};

export default function EventsPage() {
  return <EventsIndex />;
}
