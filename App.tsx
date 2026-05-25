import { useState } from 'react';
import { UserProvider, useUser } from './store/UserContext';
import { Starfield } from './components/Starfield';
import { Splash } from './components/Splash';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { ChatCompanion } from './components/ChatCompanion';

function AppContent() {
  const { isOnboarded } = useUser();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen relative text-[var(--color-text-primary)] font-body animated-bg">
      <Starfield />
      {!isOnboarded ? (
        <div className="min-h-screen flex items-center justify-center pt-8 pb-12 overflow-y-auto">
          <Onboarding />
        </div>
      ) : (
        <>
          <Dashboard />
          <ChatCompanion />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
