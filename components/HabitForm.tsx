import React, { useState, useEffect } from 'react';
import { Habit, HabitFrequency, Goal } from '../types';

interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'is_active' | 'completions' | 'current_streak'> & {id?: number}) => void;
  initialData?: Habit;
  availableGoals: Goal[];
}

const HabitForm: React.FC<HabitFormProps> = ({ onSubmit, initialData, availableGoals }) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>(HabitFrequency.DAILY);
  const [linkedGoalIds, setLinkedGoalIds] = useState<number[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setFrequency(initialData.frequency);
      setLinkedGoalIds(initialData.goal_ids || []);
    } else {
      setName('');
      setFrequency(HabitFrequency.DAILY);
      setLinkedGoalIds([]);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      name,
      frequency,
      goal_ids: linkedGoalIds
    });
  };

  const handleGoalLinkToggle = (goalId: number) => {
    setLinkedGoalIds(prev =>
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    );
  };
  
  const translateFrequency = (frequency: HabitFrequency): string => {
    switch (frequency) {
      case HabitFrequency.DAILY: return 'Diário';
      case HabitFrequency.WEEKLY: return 'Semanal';
      case HabitFrequency.MONTHLY: return 'Mensal';
      default: return frequency;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar Hábito' : 'Criar Novo Hábito'}</h2>
      <div>
        <label htmlFor="habitName" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nome do Hábito</label>
        <input
          type="text"
          id="habitName"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-pink-500 focus:border-pink-500"
        />
      </div>
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Frequência</label>
        <select
          id="frequency"
          value={frequency}
          onChange={e => setFrequency(e.target.value as HabitFrequency)}
          className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-pink-500 focus:border-pink-500"
        >
          {Object.values(HabitFrequency).map(freq => (
            <option key={freq} value={freq}>{translateFrequency(freq)}</option>
          ))}
        </select>
      </div>
      
      {availableGoals.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Vincular à(s) Meta(s) (Opcional)</label>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md border border-slate-300 dark:border-slate-600">
            {availableGoals.map(goal => (
              <div key={goal.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`goal-${goal.id}`}
                  checked={linkedGoalIds.includes(goal.id)}
                  onChange={() => handleGoalLinkToggle(goal.id)}
                  className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 text-pink-500 focus:ring-pink-500 bg-slate-200 dark:bg-slate-700"
                />
                <label htmlFor={`goal-${goal.id}`} className="ml-3 text-sm text-slate-700 dark:text-slate-200">{goal.name}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-pink-600 hover:bg-pink-700 transition-colors text-white font-bold py-2 px-6 rounded-lg shadow-md">
          {initialData ? 'Salvar Alterações' : 'Criar Hábito'}
        </button>
      </div>
    </form>
  );
};

export default HabitForm;