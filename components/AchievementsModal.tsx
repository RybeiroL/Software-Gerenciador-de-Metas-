import React from 'react';
import Modal from './Modal';
import { Achievement, AchievementId } from '../types';
import { TrophyIcon } from './Icons';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAchievements: Achievement[];
  unlockedAchievementIds: Set<AchievementId>;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, allAchievements, unlockedAchievementIds }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 text-yellow-500 dark:text-yellow-400">
          <TrophyIcon className="h-8 w-8" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Conquistas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {allAchievements.map(achievement => {
            const isUnlocked = unlockedAchievementIds.has(achievement.id);
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 flex items-center space-x-4 transition-all duration-300 ${isUnlocked ? 'bg-slate-100 dark:bg-slate-700 border-yellow-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600'}`}
              >
                <div className={`p-2 rounded-full ${isUnlocked ? 'bg-yellow-500/20 text-yellow-500 dark:text-yellow-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                    <Icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{achievement.name}</h3>
                  <p className={`text-sm ${isUnlocked ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default AchievementsModal;