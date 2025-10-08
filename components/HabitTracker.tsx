import React from 'react';
import { Habit, HabitFrequency } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface HabitTrackerProps {
  habit: Habit;
  onToggleComplete: (habitId: number, date: Date) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habit, onToggleComplete, onEdit, onDelete }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCompletedToday = habit.completions.some(c => {
    const completionDate = new Date(c.completion_date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === today.getTime();
  });

  const translateFrequency = (frequency: HabitFrequency): string => {
    switch (frequency) {
      case HabitFrequency.DAILY: return 'Diário';
      case HabitFrequency.WEEKLY: return 'Semanal';
      case HabitFrequency.MONTHLY: return 'Mensal';
      default: return frequency;
    }
  };

  return (
    <div className={`p-4 rounded-xl shadow-lg flex items-center justify-between border transition-all duration-300 ${isCompletedToday ? 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-pink-500'}`}>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800 dark:text-white">{habit.name}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{translateFrequency(habit.frequency)}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => onEdit(habit)} className="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors p-1">
          <PencilIcon />
        </button>
        <button onClick={() => onDelete(habit.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
          <TrashIcon />
        </button>
        <button
          onClick={() => onToggleComplete(habit.id, new Date())}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 transform
            ${isCompletedToday ? 'bg-green-500 hover:bg-green-600 scale-110 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-pink-500 dark:hover:bg-pink-600 text-transparent'}`}
        >
          {isCompletedToday ? '✔' : ''}
        </button>
      </div>
    </div>
  );
};

export default HabitTracker;