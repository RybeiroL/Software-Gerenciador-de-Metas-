import React from 'react';
import { Goal, Habit, GamificationData } from '../types';
import GoalCard from './GoalCard';
import HabitTracker from './HabitTracker';
import { SparklesIcon } from './Icons';
import GamificationHeader from './GamificationHeader';
import HabitHistory from './HabitHistory';
import Inspiration from './Inspiration';


interface DashboardProps {
  goals: Goal[];
  habits: Habit[];
  allHabits: Habit[];
  gamification: GamificationData;
  onToggleHabitCompletion: (habitId: number, date: Date) => void;
  onEditGoal: (goal: Goal) => void;
  onEditHabit: (habit: Habit) => void;
  onUpdateGoalProgress: (goalId: number, progress: number) => void;
  onDeleteGoal: (goalId: number) => void;
  onDeleteHabit: (habitId: number) => void;
  onSuggestHabits: () => void;
  onOpenAchievements: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ goals, habits, allHabits, gamification, onToggleHabitCompletion, onEditGoal, onEditHabit, onUpdateGoalProgress, onDeleteGoal, onDeleteHabit, onSuggestHabits, onOpenAchievements }) => {
  return (
    <div className="space-y-8">
      <GamificationHeader 
        level={gamification.level}
        experience={gamification.experience}
        experienceToNextLevel={gamification.experienceToNextLevel}
        onAchievementsClick={onOpenAchievements}
      />

      <Inspiration />
      
      <div>
        <h2 className="text-3xl font-bold mb-4 text-cyan-600 dark:text-cyan-300 border-b-2 border-cyan-500/30 dark:border-cyan-300/30 pb-2">Metas Ativas</h2>
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={onEditGoal} 
                onUpdateProgress={onUpdateGoalProgress}
                linkedHabits={allHabits.filter(h => goal.habit_ids.includes(h.id))}
                onDelete={onDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Nenhuma meta ativa. Adicione uma para começar!</p>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-3xl font-bold text-pink-500 dark:text-pink-400 border-b-2 border-pink-500/30 dark:border-pink-400/30 pb-2">Hábitos de Hoje</h2>
            <button
                onClick={onSuggestHabits}
                className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-pink-500 dark:text-pink-300 font-semibold py-2 px-4 rounded-lg shadow-md"
            >
                <SparklesIcon />
                <span>Sugestões da IA</span>
            </button>
        </div>
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {habits.map(habit => (
              <HabitTracker 
                key={habit.id} 
                habit={habit} 
                onToggleComplete={onToggleHabitCompletion}
                onEdit={onEditHabit}
                onDelete={onDeleteHabit}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Nenhum hábito ativo. Vamos construir algumas boas rotinas!</p>
        )}
      </div>

      <HabitHistory
        habits={habits}
        onToggleHabitCompletion={onToggleHabitCompletion}
      />
    </div>
  );
};

export default Dashboard;