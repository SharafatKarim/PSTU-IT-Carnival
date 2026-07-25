import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import RegistrationForm from './components/RegistrationForm';

/**
 * Top-level view router. Keeps the app dependency-free (no react-router):
 *   'landing'  → marketing landing page
 *   'register' → team registration flow
 */
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
    <RegistrationForm onBack={goToLanding} />
  ) : (
    <LandingPage onRegister={goToRegister} />
  );
};

export default App;
