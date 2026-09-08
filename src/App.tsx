import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CursorGlow } from './components/CursorGlow';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Stats } from './components/Stats';
import { LearningPath } from './components/LearningPath';
import { DailyLoop } from './components/DailyLoop';
import { EditorShowcase } from './components/EditorShowcase';
import { ChallengeLibrary } from './components/ChallengeLibrary';
import { FeaturesIndex } from './components/FeaturesIndex';
import { Dashboard } from './components/Dashboard';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { PracticeModal } from './components/PracticeModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Toasts } from './components/Toasts';

const AppContent: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, isSubModalOpen, closeSubModal } = useGame();

  return (
    <>
      <a className="skip-link" href="#journey">
        Skip to the learning path
      </a>

      <div className="grain" aria-hidden="true" />
      <CursorGlow />
      <Navbar />

      <main id="top">
        <Hero />
        <Marquee />
        <Stats />
        <LearningPath />
        <ChallengeLibrary />
        <DailyLoop />
        <EditorShowcase />
        <FeaturesIndex />
        <Dashboard />
        <FinalCTA />
      </main>

      <Footer />

      <PracticeModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <SubscriptionModal isOpen={isSubModalOpen} onClose={closeSubModal} />
      <Toasts />
    </>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary>
    <GameProvider>
      <AppContent />
    </GameProvider>
  </ErrorBoundary>
);

export default App;
