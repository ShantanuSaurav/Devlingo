import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { SkillRoadmap } from '../components/layout/SkillRoadmap';
import { Footer } from '../components/layout/Footer';

export const RoadmapPage = () => {
  return (
    <div className="bg-[var(--color-background)] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[var(--color-primary)]/30 flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1">
        <SkillRoadmap />
      </div>
      <Footer />
    </div>
  );
};
