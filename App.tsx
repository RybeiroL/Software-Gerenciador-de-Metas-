import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Goal, Habit, HabitCompletion, GoalStatus, HabitFrequency, GamificationData, Achievement, AchievementId } from './types';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import { PlusCircleIcon, ChartBarIcon, HomeIcon } from './components/Icons';
import Modal from './components/Modal';
import GoalForm from './components/GoalForm';
import HabitForm from './components/HabitForm';
import ConfirmModal from './components/ConfirmModal';
import { suggestNewHabitsBasedOnExisting } from './services/geminiService';
import HabitSuggestionModal from './components/HabitSuggestionModal';
import { ALL_ACHIEVEMENTS } from './data/achievements';
import GamificationHeader from './components/GamificationHeader';
import AchievementsModal from './components/AchievementsModal';
import AchievementToast from './components/AchievementToast';
import ThemeSwitcher from './components/ThemeSwitcher';

const initialData = {
  goals: [
    { id: 1, name: 'Aprender Testes em React', description: 'Tornar-se proficiente com React Testing Library e Jest.', due_date: '2024-12-31', progress: 25, status: GoalStatus.ACTIVE, habit_ids: [101, 102] },
    { id: 2, name: 'Correr 5km', description: 'Treinar para e completar uma corrida de 5km.', due_date: '2024-10-30', progress: 60, status: GoalStatus.ACTIVE, habit_ids: [103] },
  ],
  habits: [
    { id: 101, name: 'Programar por 30 minutos', frequency: HabitFrequency.DAILY, is_active: true, completions: [{id: 1, habit_id: 101, completion_date: new Date(Date.now() - 86400000).toISOString()}], goal_ids: [1], current_streak: 1 },
    { id: 102, name: 'Ler documentação de testes', frequency: HabitFrequency.WEEKLY, is_active: true, completions: [], goal_ids: [1], current_streak: 0 },
    { id: 103, name: 'Corrida matinal', frequency: HabitFrequency.DAILY, is_active: true, completions: [{id: 2, habit_id: 103, completion_date: new Date().toISOString()}], goal_ids: [2], current_streak: 1 },
  ]
};

const POINTS_PER_FREQUENCY = {
  [HabitFrequency.DAILY]: 10,
  [HabitFrequency.WEEKLY]: 50,
  [HabitFrequency.MONTHLY]: 150,
};
const POINTS_PER_GOAL = 250;


const App: React.FC = () => {
  const [data, setData] = useState<{ goals: Goal[]; habits: Habit[] }>(initialData);
  const { goals, habits } = data;

  const [activeView, setActiveView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setHabitModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  const [isSuggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [habitSuggestions, setHabitSuggestions] = useState<string[]>([]);
  const [isLoadingHabitSuggestions, setIsLoadingHabitSuggestions] = useState(false);
  const [habitSuggestionError, setHabitSuggestionError] = useState<string | null>(null);

  // Gamification state
  const [gamification, setGamification] = useState<GamificationData>({
    level: 1,
    points: 0,
    experience: 0,
    experienceToNextLevel: 100,
    unlockedAchievements: new Set<AchievementId>(),
  });
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [isAchievementsModalOpen, setAchievementsModalOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Prioritize saved theme in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    }
    // Otherwise, default to dark theme
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Falha ao salvar o tema no localStorage', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const activeGoals = useMemo(() => goals.filter(g => g.status === GoalStatus.ACTIVE), [goals]);
  const activeHabits = useMemo(() => habits.filter(h => h.is_active), [habits]);

  const checkAndUnlockAchievements = useCallback((currentData: { habits: Habit[]; goals: Goal[] }, currentGamification: GamificationData) => {
    const newUnlocks: Achievement[] = [];

    const check = (id: AchievementId, condition: boolean) => {
        if (condition && !currentGamification.unlockedAchievements.has(id)) {
            const achievement = ALL_ACHIEVEMENTS.find(a => a.id === id);
            if (achievement) newUnlocks.push(achievement);
        }
    };
    
    const totalCompletions = currentData.habits.reduce((sum, h) => sum + h.completions.length, 0);
    check('FIRST_HABIT', totalCompletions > 0);
    check('TEN_HABITS_COMPLETED', totalCompletions >= 10);
    check('FIVE_DAY_STREAK', currentData.habits.some(h => h.current_streak >= 5));
    check('LEVEL_TWO', currentGamification.level >= 2);

    if (newUnlocks.length > 0) {
        setGamification(prev => ({
            ...prev,
            unlockedAchievements: new Set([...prev.unlockedAchievements, ...newUnlocks.map(a => a.id)])
        }));
        setToastQueue(prev => [...prev, ...newUnlocks]);
    }
  }, []);

  const handleAddOrUpdateGoal = (goalData: Omit<Goal, 'id' | 'progress' | 'status' | 'habit_ids'> & { id?: number }) => {
    setData(prevData => {
      let updatedGoals: Goal[];
      if (goalData.id) {
        updatedGoals = prevData.goals.map(g => g.id === goalData.id ? { ...g, ...goalData } : g);
      } else {
        const newGoal: Goal = {
          ...goalData,
          id: Date.now(),
          progress: 0,
          status: GoalStatus.ACTIVE,
          habit_ids: [],
        };
        updatedGoals = [...prevData.goals, newGoal];
      }
      return { ...prevData, goals: updatedGoals };
    });
    setGoalModalOpen(false);
    setEditingGoal(undefined);
  };
  
  const handleAddOrUpdateHabit = (habitData: Omit<Habit, 'id' | 'is_active' | 'completions' | 'current_streak'> & { id?: number }) => {
    setData(prevData => {
      let updatedHabits: Habit[];
      let updatedGoals = prevData.goals;

      if (habitData.id) {
        const existingHabit = prevData.habits.find(h => h.id === habitData.id);
        updatedHabits = prevData.habits.map(h => h.id === habitData.id ? { ...existingHabit!, ...habitData } : h);
      } else {
        const newHabit: Habit = {
          ...habitData,
          id: Date.now(),
          is_active: true,
          completions: [],
          current_streak: 0,
        };
        updatedHabits = [...prevData.habits, newHabit];

        if (habitData.goal_ids.length > 0) {
          updatedGoals = prevData.goals.map(g => {
            if (habitData.goal_ids.includes(g.id)) {
              return { ...g, habit_ids: [...g.habit_ids, newHabit.id] };
            }
            return g;
          });
        }
      }
      return { goals: updatedGoals, habits: updatedHabits };
    });
    setHabitModalOpen(false);
    setEditingHabit(undefined);
  };

  const calculateStreak = (habit: Habit, completions: HabitCompletion[]): number => {
    if (habit.frequency !== HabitFrequency.DAILY || completions.length === 0) {
        return 0;
    }
    const sortedDates = completions
        .map(c => new Date(c.completion_date))
        .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 1;
    let lastDate = new Date(sortedDates[0]);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        currentDate.setHours(0, 0, 0, 0);

        const expectedPreviousDate = new Date(lastDate);
        expectedPreviousDate.setDate(lastDate.getDate() - 1);

        if (currentDate.getTime() === expectedPreviousDate.getTime()) {
            streak++;
            lastDate = currentDate;
        } else {
            break; 
        }
    }
    return streak;
  };

  const handleToggleHabitCompletion = (habitId: number, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    let pointsChange = 0;
    let habitsWithUpdatedStreak: Habit[] = [];

    const updatedHabits = data.habits.map(h => {
        if (h.id === habitId) {
            const completionIndex = h.completions.findIndex(c => c.completion_date.split('T')[0] === dateString);
            let newCompletions: HabitCompletion[];

            if (completionIndex > -1) { // Un-completing
                newCompletions = h.completions.filter((_, index) => index !== completionIndex);
                pointsChange = -POINTS_PER_FREQUENCY[h.frequency];
            } else { // Completing
                newCompletions = [...h.completions, { id: Date.now(), habit_id: habitId, completion_date: date.toISOString() }];
                pointsChange = POINTS_PER_FREQUENCY[h.frequency];
            }
            const newStreak = calculateStreak(h, newCompletions);
            return { ...h, completions: newCompletions, current_streak: newStreak };
        }
        return h;
    });

    habitsWithUpdatedStreak = updatedHabits;
    
    setData(prev => ({...prev, habits: updatedHabits}));

    setGamification(prevGamification => {
        const newPoints = prevGamification.points + pointsChange;
        let newExperience = prevGamification.experience + pointsChange;
        
        if (newExperience < 0) newExperience = 0;

        let newLevel = prevGamification.level;
        let experienceForNext = prevGamification.experienceToNextLevel;

        while (newExperience >= experienceForNext) {
            newExperience -= experienceForNext;
            newLevel++;
            experienceForNext = newLevel * 100;
        }
        
        const updatedGamificationState = {
            ...prevGamification,
            points: newPoints,
            level: newLevel,
            experience: newExperience,
            experienceToNextLevel: experienceForNext,
        };

        checkAndUnlockAchievements({ ...data, habits: habitsWithUpdatedStreak }, updatedGamificationState);
        return updatedGamificationState;
    });
  };

  const openEditGoalModal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  const openEditHabitModal = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitModalOpen(true);
  };
  
  const updateGoalProgress = (goalId: number, progress: number) => {
    let goalCompleted = false;
    const goal = data.goals.find(g => g.id === goalId);
    if (goal && goal.progress < 100 && progress >= 100) {
        goalCompleted = true;
    }

    setData(prevData => ({
      ...prevData,
      goals: prevData.goals.map(g => g.id === goalId ? {...g, progress: Math.max(0, Math.min(100, progress))} : g)
    }));

    if (goalCompleted) {
        setGamification(prev => {
            const updatedGamification = {...prev, points: prev.points + POINTS_PER_GOAL, experience: prev.experience + POINTS_PER_GOAL};
            // Check Goal Crusher achievement
            if (!updatedGamification.unlockedAchievements.has('GOAL_CRUSHER')) {
                const achievement = ALL_ACHIEVEMENTS.find(a => a.id === 'GOAL_CRUSHER');
                if (achievement) {
                    setToastQueue(q => [...q, achievement]);
                    updatedGamification.unlockedAchievements.add('GOAL_CRUSHER');
                }
            }
            return updatedGamification;
        });
    }
  };
  
  const handleDeleteGoal = (goalIdToDelete: number) => {
    setData(currentData => {
      const updatedGoals = currentData.goals.filter(
        (goal) => goal.id !== goalIdToDelete
      );
      const updatedHabits = currentData.habits.map((habit) => {
        if (habit.goal_ids.includes(goalIdToDelete)) {
          return {
            ...habit,
            goal_ids: habit.goal_ids.filter((id) => id !== goalIdToDelete),
          };
        }
        return habit;
      });
      return {
        goals: updatedGoals,
        habits: updatedHabits,
      };
    });
    setConfirmation(null);
  };

  const handleDeleteHabit = (habitIdToDelete: number) => {
    setData(currentData => {
      const updatedHabits = currentData.habits.filter(
        (habit) => habit.id !== habitIdToDelete
      );
      const updatedGoals = currentData.goals.map((goal) => {
        if (goal.habit_ids.includes(habitIdToDelete)) {
          return {
            ...goal,
            habit_ids: goal.habit_ids.filter((id) => id !== habitIdToDelete),
          };
        }
        return goal;
      });
      return {
        goals: updatedGoals,
        habits: updatedHabits,
      };
    });
    setConfirmation(null);
  };
  
  const requestGoalDeletion = (goalId: number) => {
    setConfirmation({
      title: 'Excluir Meta',
      message: 'Tem certeza de que deseja excluir esta meta? Hábitos vinculados não serão excluídos, mas o vínculo será removido. Esta ação não pode ser desfeita.',
      onConfirm: () => handleDeleteGoal(goalId),
    });
  };

  const requestHabitDeletion = (habitId: number) => {
    setConfirmation({
      title: 'Excluir Hábito',
      message: 'Tem certeza de que deseja excluir este hábito? O vínculo com as metas será removido. Esta ação não pode ser desfeita.',
      onConfirm: () => handleDeleteHabit(habitId),
    });
  };

  const handleGetHabitSuggestions = async () => {
    setSuggestionModalOpen(true);
    setIsLoadingHabitSuggestions(true);
    setHabitSuggestionError(null);
    setHabitSuggestions([]);
    try {
        const suggestions = await suggestNewHabitsBasedOnExisting(data.habits);
        setHabitSuggestions(suggestions);
    } catch (err) {
        setHabitSuggestionError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
    } finally {
        setIsLoadingHabitSuggestions(false);
    }
  };

  const handleAddSuggestedHabit = (habitName: string) => {
      const newHabit: Habit = {
          id: Date.now(),
          name: habitName,
          frequency: HabitFrequency.DAILY,
          is_active: true,
          completions: [],
          goal_ids: [],
          current_streak: 0,
      };
      setData(prevData => ({
          ...prevData,
          habits: [...prevData.habits, newHabit],
      }));
      setHabitSuggestions(prev => prev.filter(s => s !== habitName));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-4 sticky top-0 z-20 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">Arquiteto de Hábitos e Metas IA</h1>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
            <button onClick={() => setHabitModalOpen(true)} className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 transition-colors text-white font-semibold py-2 px-4 rounded-lg shadow-md">
                <PlusCircleIcon />
                <span className="hidden sm:inline">Novo Hábito</span>
            </button>
            <button onClick={() => setGoalModalOpen(true)} className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 transition-colors text-white font-semibold py-2 px-4 rounded-lg shadow-md">
                <PlusCircleIcon />
                <span className="hidden sm:inline">Nova Meta</span>
            </button>
        </div>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        {activeView === 'dashboard' ? (
          <Dashboard
            goals={activeGoals}
            habits={activeHabits}
            allHabits={habits}
            gamification={gamification}
            onToggleHabitCompletion={handleToggleHabitCompletion}
            onEditGoal={openEditGoalModal}
            onEditHabit={openEditHabitModal}
            onUpdateGoalProgress={updateGoalProgress}
            onDeleteGoal={requestGoalDeletion}
            onDeleteHabit={requestHabitDeletion}
            onSuggestHabits={handleGetHabitSuggestions}
            onOpenAchievements={() => setAchievementsModalOpen(true)}
          />
        ) : (
          <Analytics goals={goals} habits={habits} theme={theme} />
        )}
      </main>
      
      <Modal isOpen={isGoalModalOpen} onClose={() => { setGoalModalOpen(false); setEditingGoal(undefined); }}>
        <GoalForm 
          onSubmit={handleAddOrUpdateGoal} 
          initialData={editingGoal} 
          onAddHabit={(habitName) => {
            setData(prevData => {
              const newHabit: Habit = { 
                  id: Date.now(), name: habitName, frequency: HabitFrequency.DAILY, is_active: true, completions: [], goal_ids: editingGoal ? [editingGoal.id] : [], current_streak: 0,
              };
              const newHabits = [...prevData.habits, newHabit];
              const newGoals = editingGoal ? prevData.goals.map(g => g.id === editingGoal.id ? {...g, habit_ids: [...g.habit_ids, newHabit.id]} : g) : prevData.goals;
              return { goals: newGoals, habits: newHabits };
            });
          }}
        />
      </Modal>

      <Modal isOpen={isHabitModalOpen} onClose={() => { setHabitModalOpen(false); setEditingHabit(undefined); }}>
        <HabitForm onSubmit={handleAddOrUpdateHabit} initialData={editingHabit} availableGoals={goals} />
      </Modal>

      {confirmation && (
        <ConfirmModal
            isOpen={true}
            onClose={() => setConfirmation(null)}
            onConfirm={confirmation.onConfirm}
            title={confirmation.title}
            message={confirmation.message}
        />
      )}

      <HabitSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setSuggestionModalOpen(false)}
        suggestions={habitSuggestions}
        onAddHabit={handleAddSuggestedHabit}
        isLoading={isLoadingHabitSuggestions}
        error={habitSuggestionError}
        onRetry={handleGetHabitSuggestions}
      />

      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        allAchievements={ALL_ACHIEVEMENTS}
        unlockedAchievementIds={gamification.unlockedAchievements}
      />
      
      <div className="fixed bottom-20 sm:bottom-4 right-4 z-50 space-y-3">
        {toastQueue.map((achievement) => (
          <AchievementToast 
            key={achievement.id} 
            achievement={achievement} 
            onDismiss={() => setToastQueue(q => q.filter(item => item.id !== achievement.id))}
          />
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 flex justify-around p-2 sm:hidden">
        <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === 'dashboard' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
          <HomeIcon />
          <span className="text-xs">Painel</span>
        </button>
        <button onClick={() => setActiveView('analytics')} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === 'analytics' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
          <ChartBarIcon />
          <span className="text-xs">Análises</span>
        </button>
      </nav>
        <div className="hidden sm:block sm:fixed sm:left-4 sm:top-1/2 sm:-translate-y-1/2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <button onClick={() => setActiveView('dashboard')} className={`p-3 rounded-lg block mb-2 transition-colors ${activeView === 'dashboard' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Painel">
                <HomeIcon />
            </button>
            <button onClick={() => setActiveView('analytics')} className={`p-3 rounded-lg block transition-colors ${activeView === 'analytics' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Análises">
                <ChartBarIcon />
            </button>
        </div>
        <div className="pb-20 sm:pb-0 sm:pl-20"></div>
    </div>
  );
};

export default App;