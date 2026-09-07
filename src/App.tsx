import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { DashboardLayout } from './pages/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';

import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';

import { LearnPage } from './pages/LearnPage';
import { PracticePage } from './pages/PracticePage';
import { ChallengesPage } from './pages/ChallengesPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { CommunityPage } from './pages/CommunityPage';

// Dummy components for other dashboard pages to avoid routing errors
const DummyPage = ({ title }: { title: string }) => (
  <div className="p-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1></div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/community" element={<CommunityPage />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="learn" element={<DummyPage title="Learn" />} />
            <Route path="practice" element={<DummyPage title="Practice" />} />
            <Route path="challenges" element={<DummyPage title="Challenges" />} />
            <Route path="roadmap" element={<DummyPage title="Roadmap" />} />
            <Route path="achievements" element={<DummyPage title="Achievements" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
