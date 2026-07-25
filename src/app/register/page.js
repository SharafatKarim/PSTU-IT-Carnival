import RegistrationForm from '../../components/RegistrationForm';

export const metadata = {
  title: 'IUPC Pre-Registration — PSTU IT Carnival 2026',
  description:
    'Pre-register your team for the IUPC (South Zone) programming contest at PSTU IT Carnival 2026. Teams of exactly three members, held 13 August 2026 at CSE–FBA Building, PSTU.',
  openGraph: {
    title: 'IUPC Pre-Registration — PSTU IT Carnival 2026',
    description:
      'Register your three-member team for the flagship ICPC-style contest of PSTU IT Carnival 2026.',
    type: 'website',
  },
};

export default function RegisterPage() {
  return <RegistrationForm />;
}
