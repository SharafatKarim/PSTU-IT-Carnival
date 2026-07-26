import GamingHub from '@/components/gaming/GamingHub';
import { EVENT } from '@/data/content';

const title = `Gaming Fest — ${EVENT.title}`;

export const metadata = {
  title,
  description:
    'Three esports tournaments at PSTU IT Carnival 2026 — eFootball, PUBG Mobile and Free Fire. Formats, rules, prizes and online registration.',
  openGraph: {
    title,
    description:
      'eFootball, PUBG Mobile and Free Fire tournaments at Patuakhali Science and Technology University. Registration open now.',
    type: 'website',
  },
};

export default function GamingPage() {
  return <GamingHub />;
}
