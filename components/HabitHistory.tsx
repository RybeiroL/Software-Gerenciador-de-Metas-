import React from 'react';
import { Habit } from '../types';

interface HabitHistoryProps {
  habits: Habit[];
  onToggleHabitCompletion: (habitId: number, date: Date) => void;
}

const HabitHistory: React.FC<HabitHistoryProps> = ({ habits, onToggleHabitCompletion }) => {
  // Generate the last 7 dates, from 6 days ago to today
  const dates: Date[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });

  const isCompletedOnDate = (habit: Habit, date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return habit.completions.some(c => c.completion_date.startsWith(dateString));
  };

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500/30 dark:border-purple-400/30 pb-2">Histórico de Hábitos</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-slate-700 overflow-x-auto">
        {habits.length > 0 ? (
          <div className="grid items-center gap-x-2 gap-y-4 min-w-[450px]" style={{ gridTemplateColumns: 'minmax(120px, 1fr) repeat(7, minmax(40px, 1fr))' }}>
            {/* Header */}
            <div className="font-semibold text-slate-500 dark:text-slate-400 text-left sticky left-0 bg-white dark:bg-slate-800 pr-2">Hábito</div>
            {dates.map(date => (
              <div key={date.toISOString()} className="text-center font-semibold text-slate-500 dark:text-slate-400">
                <div className="text-xs uppercase">{dayFormatter.format(date).replace('.', '')}</div>
                <div className="text-lg">{dateFormatter.format(date)}</div>
              </div>
            ))}

            {/* Body */}
            {habits.map(habit => (
              <React.Fragment key={habit.id}>
                <div className="font-medium text-slate-800 dark:text-white text-left sticky left-0 bg-white dark:bg-slate-800 pr-2">{habit.name}</div>
                {dates.map(date => {
                  const completed = isCompletedOnDate(habit, date);
                  return (
                    <div key={`${habit.id}-${date.toISOString()}`} className="flex justify-center items-center">
                      <button
                        onClick={() => onToggleHabitCompletion(habit.id, date)}
                        aria-label={`Marcar '${habit.name}' como ${completed ? 'não concluído' : 'concluído'} em ${date.toLocaleDateString('pt-BR')}`}
                        className={`w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 ${
                          completed ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {completed ? '✔' : ''}
                      </button>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">Nenhum hábito ativo para exibir no histórico.</p>
        )}
      </div>
    </div>
  );
};

export default HabitHistory;