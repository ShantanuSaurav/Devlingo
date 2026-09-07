import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Award, ArrowRight, CheckCircle2, Circle, Code2 } from 'lucide-react';

// Fake activity data for the github-style graph
const generateActivity = () => {
  const data = [];
  for (let i = 0; i < 14; i++) {
    const col = [];
    for (let j = 0; j < 7; j++) {
      col.push(Math.floor(Math.random() * 4)); // 0-3 intensity
    }
    data.push(col);
  }
  return data;
};
const activityData = generateActivity();

export const DashboardHome = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <header className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Good evening, Developer.</h1>
          <p className="text-gray-600 dark:text-gray-400">You're on a 12-day streak. Keep it up!</p>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -2 }} className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center">
            <Flame size={24} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Current Streak</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">12 Days</div>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ y: -2 }} className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Zap size={24} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total XP</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">4,820 XP</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)]/10 flex items-center justify-center">
            <Award size={24} className="text-[var(--color-secondary)]" />
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Current Level</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">Level 08</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Learning */}
          <div className="bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-black/5 dark:border-white/5 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-4 tracking-wider uppercase">Continue Learning</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">JavaScript Fundamentals</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Module 4: Arrays and Objects</p>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-mono text-[var(--color-primary)]">78%</span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] w-[78%]" />
                </div>
              </div>

              <button className="flex items-center space-x-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Activity Visualization */}
          <div className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Learning Activity</h3>
            <div className="flex space-x-1.5 overflow-x-auto pb-4">
              {activityData.map((col, i) => (
                <div key={i} className="flex flex-col space-y-1.5">
                  {col.map((val, j) => {
                    const colors = [
                      'bg-black/5 dark:bg-white/5', // 0
                      'bg-[var(--color-primary)]/30', // 1
                      'bg-[var(--color-primary)]/60', // 2
                      'bg-[var(--color-primary)]', // 3
                    ];
                    return (
                      <div 
                        key={j} 
                        className={`w-3.5 h-3.5 rounded-sm ${colors[val]} hover:ring-2 hover:ring-white transition-all cursor-pointer`}
                        title={`Activity level ${val}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4 text-xs text-gray-500 font-medium">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-sm bg-black/5 dark:bg-white/5" />
                <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/30" />
                <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/60" />
                <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]" />
              </div>
              <span>More</span>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* Daily Goals */}
          <div className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Daily Goals</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <CheckCircle2 size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-900 dark:text-white font-medium line-through opacity-70">Complete 1 lesson</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">+50 XP</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <CheckCircle2 size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-900 dark:text-white font-medium line-through opacity-70">Earn 200 XP</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">200 / 200 XP</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 group cursor-pointer">
                <Circle size={20} className="text-gray-500 shrink-0 mt-0.5 group-hover:text-[var(--color-secondary)] transition-colors" />
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">Solve today's challenge</div>
                  <div className="text-xs text-[var(--color-secondary)] font-mono mt-1">+250 XP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Achievements</h3>
              <span className="text-xs text-[var(--color-secondary)] hover:underline cursor-pointer">View All</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                  <Flame size={20} className="text-[var(--color-warning)]" />
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white text-sm font-medium">Seven Day Streak</div>
                  <div className="text-xs text-gray-500">Earned 5 days ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
                  <Code2 size={20} className="text-[#a855f7]" />
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white text-sm font-medium">First Commit</div>
                  <div className="text-xs text-gray-500">Earned 12 days ago</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
