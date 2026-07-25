'use client';

import { useState } from 'react';
import LandingPage from '../components/LandingPage';
import RegistrationForm from '../components/RegistrationForm';

const Loading = () => (
  <div className="grid min-h-screen place-items-center bg-ink-950 text-sm text-mist-300">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-grape-400 border-t-transparent" />
  </div>
);

export default function Home() {
  const [view, setView] = useState('landing');

  const goToRegister = () => {
    setView('register');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const goToLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return view === 'register' ? (
    <RegistrationForm onBack={goToLanding} />
  ) : (
    <LandingPage onRegister={goToRegister} />
  );
}
