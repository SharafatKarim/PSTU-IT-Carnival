import { lazy, Suspense, useState } from 'react';
import LandingPage from './pages/LandingPage';

// Split the form (and react-hook-form) into a separate chunk so it only
// loads when a visitor actually opens registration.
const RegistrationForm = lazy(() => import('./components/RegistrationForm'));

const Loading = () => (
  <div className="grid min-h-screen place-items-center bg-ink-950 text-sm text-mist-300">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-grape-400 border-t-transparent" />
  </div>
);

const App = () => {
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
    <Suspense fallback={<Loading />}>
      <RegistrationForm onBack={goToLanding} />
    </Suspense>
  ) : (
    <LandingPage onRegister={goToRegister} />
  );
};

export default App;
