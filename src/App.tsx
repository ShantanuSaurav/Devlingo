import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { CursorGlow } from './components/CursorGlow';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Stats } from './components/Stats';
import { LearningPath } from './components/LearningPath';
import { DailyLoop } from './components/DailyLoop';
import { EditorShowcase } from './components/EditorShowcase';
import { FeaturesIndex } from './components/FeaturesIndex';
import { Dashboard } from './components/Dashboard';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { PracticeModal } from './components/PracticeModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';

export const AppContent: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, isSubModalOpen, closeSubModal } = useGame();

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <CursorGlow />
      <Navbar />

      <main id="top">
        <Hero />
        <Marquee />
        <Stats />
        <LearningPath />
        <DailyLoop />
        <EditorShowcase />
        <FeaturesIndex />
        <Dashboard />
        <FinalCTA />
      </main>

      <Footer />

      {/* Interactive Modals */}
      <PracticeModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <SubscriptionModal isOpen={isSubModalOpen} onClose={closeSubModal} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
