import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Gamification } from '../components/layout/Gamification';
import { Footer } from '../components/layout/Footer';

export const PracticePage = () => {
  return (
    <div className="bg-[var(--color-background)] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[var(--color-primary)]/30 flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1">
        <Gamification />
      </div>
      <Footer />
    </div>
  );
};
