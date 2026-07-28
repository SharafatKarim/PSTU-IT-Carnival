import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import VolunteerRegistrationPageContent from '@/components/volunteer/VolunteerRegistrationPageContent';

export const metadata = {
  title: 'Register as Volunteer — PSTU IT Carnival 2026',
  description:
    'Join the volunteer team for PSTU IT Carnival 2026. Select your preferred events and roles.',
};

export default function VolunteerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-white">
      <Navbar />
      <main className="flex-1">
        <VolunteerRegistrationPageContent />
      </main>
      <Footer />
    </div>
  );
}
