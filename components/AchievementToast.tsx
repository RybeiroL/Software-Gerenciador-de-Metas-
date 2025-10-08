import React, { useEffect } from 'react';
import { Achievement } from '../types';
import { TrophyIcon } from './Icons';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Disappears after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = achievement.icon || TrophyIcon;

  return (
    <div 
      className="bg-white dark:bg-slate-800 border-2 border-yellow-500 rounded-xl shadow-2xl p-4 w-80 flex items-center space-x-4 animate-slide-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-yellow-400">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <p className="font-bold text-slate-900 dark:text-white">Conquista Desbloqueada!</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{achievement.name}</p>
      </div>
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AchievementToast;