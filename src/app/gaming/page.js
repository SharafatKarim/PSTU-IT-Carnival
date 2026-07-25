import GamingHub from '../../components/gaming/GamingHub';

export const metadata = {
  title: 'Gaming Fest — PSTU IT Carnival 2026',
  description:
    'Three esports tournaments at PSTU IT Carnival 2026 — eFootball, PUBG Mobile and Free Fire. Formats, rules, prizes and online registration.',
  openGraph: {
    title: 'Gaming Fest — PSTU IT Carnival 2026',
    description:
      'eFootball, PUBG Mobile and Free Fire tournaments at Patuakhali Science and Technology University. Registration open now.',
    type: 'website',
  },
};

export default function GamingPage() {
  return <GamingHub />;
}
