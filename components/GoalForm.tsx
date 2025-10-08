import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { suggestHabits } from '../services/geminiService';
import { SparklesIcon, PlusCircleIcon } from './Icons';

interface GoalFormProps {
  onSubmit: (goal: Omit<Goal, 'progress' | 'status' | 'habit_ids'> & {id?: number}) => void;
  initialData?: Goal;
  onAddHabit: (habitName: string) => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, initialData, onAddHabit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setDueDate(initialData.due_date ? initialData.due_date.split('T')[0] : '');
    } else {
      setName('');
      setDescription('');
      setDueDate('');
    }
    setSuggestions([]);
    setIsLoadingSuggestions(false);
    setError(null);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      name,
      description,
      due_date: dueDate || null,
    });
  };
  
  const handleGetSuggestions = async () => {
    if (!name) {
      setError("Por favor, insira um nome para a meta para obter sugestões.");
      return;
    }
    setIsLoadingSuggestions(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await suggestHabits(name, description);
      setSuggestions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar Meta' : 'Criar Nova Meta'}</h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nome da Meta</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Descrição</label>
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Data de Vencimento (Opcional)</label>
        <input
          type="date"
          id="due_date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
      
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-300 mb-2">Sugestões de Hábitos por IA</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Deixe a IA ajudar a dividir sua meta em hábitos práticos.</p>
        <button type="button" onClick={handleGetSuggestions} disabled={isLoadingSuggestions} className="w-full flex items-center justify-center space-x-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            <SparklesIcon/>
            <span>{isLoadingSuggestions ? 'Pensando...' : 'Gerar Sugestões'}</span>
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-slate-700 dark:text-slate-200">{s}</p>
                <button type="button" onClick={() => onAddHabit(s)} className="text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 p-1" title="Adicionar como novo hábito">
                  <PlusCircleIcon/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6">
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 transition-colors text-white font-bold py-2 px-6 rounded-lg shadow-md">
          {initialData ? 'Salvar Alterações' : 'Criar Meta'}
        </button>
      </div>
    </form>
  );
};

export default GoalForm;