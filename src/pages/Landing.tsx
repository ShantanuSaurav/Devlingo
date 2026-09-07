import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/layout/Hero';
import { SocialProof } from '../components/layout/SocialProof';
import { HowItWorks } from '../components/layout/HowItWorks';

import { FinalCTA } from '../components/layout/FinalCTA';
import { Footer } from '../components/layout/Footer';

export const Landing = () => {
  return (
    <div className="bg-[var(--color-background)] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[var(--color-primary)]/30">
      <Navbar />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </div>
  );
};
