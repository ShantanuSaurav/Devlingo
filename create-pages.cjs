const fs = require('fs');

const pages = [
  { name: 'LearnPage', component: 'LearningExperience' },
  { name: 'PracticePage', component: 'Gamification' },
  { name: 'ChallengesPage', component: 'DailyChallenge' },
  { name: 'RoadmapPage', component: 'SkillRoadmap' },
  { name: 'CommunityPage', component: 'Community' },
];

pages.forEach(p => {
  const content = `import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ${p.component} } from '../components/layout/${p.component}';
import { Footer } from '../components/layout/Footer';

export const ${p.name} = () => {
  return (
    <div className="bg-[var(--color-background)] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[var(--color-primary)]/30 flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1">
        <${p.component} />
      </div>
      <Footer />
    </div>
  );
};
`;
  fs.writeFileSync(`./src/pages/${p.name}.tsx`, content, 'utf8');
});
console.log('Pages created.');
