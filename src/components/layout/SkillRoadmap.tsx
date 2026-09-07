import React from 'react';
import { motion } from 'framer-motion';
import { Network, Database, Layout, Server, Lock } from 'lucide-react';

const categories = [
  {
    title: 'Frontend',
    icon: <Layout size={20} className="text-[var(--color-secondary)]" />,
    skills: [
      { name: 'HTML', progress: 100 },
      { name: 'CSS', progress: 100 },
      { name: 'JavaScript', progress: 80 },
      { name: 'React', progress: 30 },
      { name: 'Next.js', progress: 0 },
    ]
  },
  {
    title: 'Backend',
    icon: <Server size={20} className="text-[var(--color-primary)]" />,
    skills: [
      { name: 'Node.js', progress: 0 },
      { name: 'APIs', progress: 0 },
      { name: 'Databases', progress: 0 },
      { name: 'Auth', progress: 0 },
    ]
  },
  {
    title: 'DevOps & Cloud',
    icon: <Database size={20} className="text-purple-400" />,
    skills: [
      { name: 'Git', progress: 100 },
      { name: 'Docker', progress: 0 },
      { name: 'CI/CD', progress: 0 },
      { name: 'AWS Basics', progress: 0 },
    ]
  },
  {
    title: 'Computer Science',
    icon: <Network size={20} className="text-[var(--color-warning)]" />,
    skills: [
      { name: 'DSA', progress: 10 },
      { name: 'OS Concepts', progress: 0 },
      { name: 'Networking', progress: 0 },
      { name: 'System Design', progress: 0 },
    ]
  }
];

export const SkillRoadmap = () => {
  return (
    <section className="py-32 bg-white dark:bg-[#0d1117] border-y border-black/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Master the Stack.</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            An interactive skill tree mapping out everything from basic syntax to advanced system design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="bg-gray-50 dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.title}</h3>
              </div>
              
              <div className="space-y-4 relative">
                {/* Connecting Line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-black/5 dark:bg-white/10 z-0" />
                
                {category.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="relative z-10 flex items-center group cursor-pointer">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-gray-50 dark:bg-[#161b22] transition-colors
                      ${skill.progress === 100 
                        ? 'border-[var(--color-primary)]' 
                        : skill.progress > 0 
                        ? 'border-[var(--color-secondary)]' 
                        : 'border-gray-600'}
                    `}>
                      {skill.progress === 100 && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />}
                      {skill.progress > 0 && skill.progress < 100 && <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />}
                      {skill.progress === 0 && <Lock size={10} className="text-gray-600" />}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${skill.progress > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                          {skill.name}
                        </span>
                        {skill.progress > 0 && (
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{skill.progress}%</span>
                        )}
                      </div>
                      
                      <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full ${skill.progress === 100 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)]'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
