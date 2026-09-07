import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Zap, Trophy } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Learn',
    desc: 'Interactive lessons with bite-sized concepts.',
    icon: <BookOpen size={24} />,
    color: 'text-[var(--color-secondary)]',
    bg: 'bg-[var(--color-secondary)]/10',
  },
  {
    step: '02',
    title: 'Practice',
    desc: 'Solve coding exercises and challenges.',
    icon: <Code2 size={24} />,
    color: 'text-[#a855f7]',
    bg: 'bg-[#a855f7]/10',
  },
  {
    step: '03',
    title: 'Build',
    desc: 'Apply knowledge to real-world projects.',
    icon: <Zap size={24} />,
    color: 'text-[var(--color-primary)]',
    bg: 'bg-[var(--color-primary)]/10',
  },
  {
    step: '04',
    title: 'Level Up',
    desc: 'Track progress and unlock new skills.',
    icon: <Trophy size={24} />,
    color: 'text-[var(--color-warning)]',
    bg: 'bg-[var(--color-warning)]/10',
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">The Developer Journey</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">A structured path from fundamental concepts to advanced system design.</p>
        </div>

        <div className="relative">
          {/* Horizontal Line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-black/5 dark:bg-white/10 -translate-y-1/2 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 p-8 rounded-2xl group hover:border-black/10 dark:border-white/10 transition-colors"
              >
                <div className="text-sm font-mono text-gray-500 mb-6">Step {step.step}</div>
                <div className={`w-14 h-14 rounded-xl ${step.bg} ${step.color} flex items-center justify-center mb-6`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
