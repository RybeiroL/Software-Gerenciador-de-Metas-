import React from 'react';
import { TrophyIcon } from './Icons';

interface GamificationHeaderProps {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  onAchievementsClick: () => void;
}

const GamificationHeader: React.FC<GamificationHeaderProps> = ({ level, experience, experienceToNextLevel, onAchievementsClick }) => {
  const progressPercent = experienceToNextLevel > 0 ? (experience / experienceToNextLevel) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-8 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex-grow w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-lg text-yellow-500 dark:text-yellow-400">Nível {level}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{experience} / {experienceToNextLevel} XP</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 border border-slate-300 dark:border-slate-600">
          <div 
            className="bg-yellow-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      <button 
        onClick={onAchievementsClick}
        className="flex-shrink-0 flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 transition-colors text-white font-semibold py-2 px-4 rounded-lg shadow-md w-full sm:w-auto"
      >
        <TrophyIcon className="h-5 w-5" />
        <span>Conquistas</span>
      </button>
    </div>
  );
};

export default GamificationHeader;