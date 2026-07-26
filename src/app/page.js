import LandingPage from '@/components/LandingPage';

/* The IUPC form now lives at its own route (/register) rather than behind a
   view-switching useState, so every destination on the site has a real URL. */
export default function Home() {
  return <LandingPage />;
}
