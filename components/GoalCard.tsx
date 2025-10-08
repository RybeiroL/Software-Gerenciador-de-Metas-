import React from 'react';
import { Goal, Habit } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface GoalCardProps {
  goal: Goal;
  linkedHabits: Habit[];
  onEdit: (goal: Goal) => void;
  onUpdateProgress: (goalId: number, progress: number) => void;
  onDelete: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, linkedHabits, onEdit, onUpdateProgress, onDelete }) => {
  const { id, name, description, due_date, progress } = goal;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProgress(id, parseInt(e.target.value, 10));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-700 hover:border-cyan-500 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{name}</h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => onEdit(goal)} className="text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              <PencilIcon />
            </button>
            <button onClick={() => onDelete(id)} className="text-slate-400 hover:text-red-500 transition-colors">
              <TrashIcon />
            </button>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-4 h-12 overflow-hidden">{description}</p>
        {due_date && <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Vencimento: {new Date(due_date).toLocaleDateString()}</p>}
        {linkedHabits.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Hábitos Vinculados:</h4>
            <div className="flex flex-wrap gap-2">
              {linkedHabits.map(h => (
                <span key={h.id} className="text-xs bg-slate-200 dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 px-2 py-1 rounded-full">{h.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Progresso</span>
          <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{progress}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
          <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleProgressChange}
          className="w-full h-1 bg-transparent cursor-pointer appearance-none focus:outline-none focus:ring-0 focus:shadow-none mt-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-slate-300 dark:[&::-webkit-slider-runnable-track]:bg-slate-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 dark:[&::-webkit-slider-thumb]:bg-cyan-400"
        />
      </div>
    </div>
  );
};

export default GoalCard;