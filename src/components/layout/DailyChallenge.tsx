import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, HelpCircle, Code2, Play } from 'lucide-react';

export const DailyChallenge = () => {
  return (
    <section className="py-32 bg-white dark:bg-[#0d1117] relative">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="bg-gray-50 dark:bg-[#161b22] border border-red-500/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,59,48,0.05)] relative">
          
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-red-500/10 to-transparent border-b border-red-500/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crosshair size={20} className="text-red-500" />
              <h3 className="text-gray-900 dark:text-white font-bold tracking-wide">DAILY CHALLENGE</h3>
            </div>
            <div className="flex items-center space-x-4 text-sm font-mono">
              <span className="text-[var(--color-warning)]">Reward: +250 XP</span>
              <span className="text-red-400">Difficulty: Medium</span>
            </div>
          </div>

          <div className="p-8">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fix the Bug</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Why isn't this function returning a new array?</p>

            <div className="bg-[#0d1117] p-6 rounded-xl font-mono text-sm leading-relaxed border border-black/5 dark:border-white/5 text-gray-300 mb-8">
              <span className="text-purple-400">const</span> numbers = [1, 2, 3];<br/><br/>
              numbers.<span className="text-blue-400">map</span>(num =&gt; {'{'}<br/>
              &nbsp;&nbsp;<span className="text-blue-400">console</span>.<span className="text-yellow-200">log</span>(num * 2);<br/>
              {'}'});
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                <Code2 size={18} />
                <span>Solve Challenge</span>
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-black/5 dark:bg-white/10 transition-colors border border-black/10 dark:border-white/10">
                <HelpCircle size={18} />
                <span>View Hint</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
