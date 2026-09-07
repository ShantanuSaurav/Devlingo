import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Award } from 'lucide-react';

const activities = [
  {
    user: 'Sarah',
    avatar: 'bg-purple-500',
    action: 'completed React Hooks',
    reward: '+450 XP',
    icon: <Zap size={16} className="text-[var(--color-primary)]" />,
    time: '2m ago',
  },
  {
    user: 'Rahul',
    avatar: 'bg-blue-500',
    action: 'solved Daily Challenge',
    reward: 'Streak: 21 Days',
    icon: <Flame size={16} className="text-[var(--color-warning)]" />,
    time: '15m ago',
  },
  {
    user: 'Maya',
    avatar: 'bg-green-500',
    action: 'unlocked: System Design Explorer',
    reward: 'Level Up!',
    icon: <Award size={16} className="text-[var(--color-secondary)]" />,
    time: '1h ago',
  },
];

export const Community = () => {
  return (
    <section className="py-32 bg-gray-50 dark:bg-[#161b22]/30 border-t border-black/5 dark:border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Join the Community.</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            See what other developers are learning and building right now.
          </p>
        </div>

        <div className="space-y-4">
          {activities.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-[#0d1117] border border-black/5 dark:border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-black/10 dark:border-white/10 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full ${item.avatar} flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm shadow-inner`}>
                  {item.user.charAt(0)}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {item.user} <span className="text-gray-600 dark:text-gray-400 font-normal">{item.action}</span>
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{item.time}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5">
                {item.icon}
                <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">{item.reward}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
