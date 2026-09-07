import React from 'react';
import { motion } from 'framer-motion';
import { Play, Lightbulb, CheckCircle2 } from 'lucide-react';

export const LearningExperience = () => {
  return (
    <section className="py-32 bg-white dark:bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Text */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Learn by Doing.</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              No long videos. Just interactive, bite-sized lessons that get straight to the point.
            </p>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">JavaScript Basics</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Variables allow you to store data.</p>
                <div className="bg-[#0d1117] p-4 rounded-lg font-mono text-sm border border-black/5 dark:border-white/5 text-gray-300">
                  <span className="text-purple-400">const</span> developer = <span className="text-green-400">"Alex"</span>;
                </div>
              </div>
            </div>
          </div>

          {/* Right Editor */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#161b22] shadow-2xl"
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 bg-[#0d1117]">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="font-mono text-xs text-gray-500">levelUp.js</div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Editor Body */}
            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto text-gray-300">
              <div className="flex">
                <span className="text-gray-600 select-none mr-4">1</span>
                <span><span className="text-purple-400">function</span> <span className="text-blue-400">levelUp</span>() {'{'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 select-none mr-4">2</span>
                <span className="pl-4"><span className="text-purple-400">return</span> <span className="text-green-400">"Developer unlocked!"</span>;</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 select-none mr-4">3</span>
                <span>{'}'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 select-none mr-4">4</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 select-none mr-4">5</span>
                <span><span className="text-blue-400">console</span>.<span className="text-yellow-200">log</span>(<span className="text-blue-400">levelUp</span>());</span>
              </div>
            </div>

            {/* Editor Footer / Actions */}
            <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-[#0d1117] flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors font-medium text-sm">
                  <Play size={16} />
                  <span>Run Code</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                  <Lightbulb size={16} />
                  <span>Hint</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-green-400 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  <span>Success</span>
                </div>
                <div className="font-mono text-sm text-[var(--color-warning)] font-bold">
                  +15 XP
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
