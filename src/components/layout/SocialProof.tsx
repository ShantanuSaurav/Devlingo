import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '1M+', label: 'Challenges Completed' },
  { value: '250+', label: 'Developer Skills' },
  { value: '4.9/5', label: 'Community Rating' },
];

export const SocialProof = () => {
  return (
    <section className="py-24 border-y border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#161b22]/50 relative">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-12 tracking-widest uppercase">
          Built for Developers Who Want to Keep Growing
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
