import React from 'react';
import { Goal, Habit } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  goals: Goal[];
  habits: Habit[];
  theme: 'light' | 'dark';
}

const Analytics: React.FC<AnalyticsProps> = ({ goals, habits, theme }) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#475569'; // slate-400 vs slate-600
  const gridColor = isDark ? '#374151' : '#e2e8f0'; // slate-700 vs slate-200

  const goalProgressData = goals.map(goal => ({
    name: goal.name,
    progress: goal.progress,
  }));

  const habitCompletionData = habits.map(habit => ({
    name: habit.name,
    completions: habit.completions.length,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-700 p-2 border border-slate-200 dark:border-slate-600 rounded shadow-lg">
          <p className="label text-slate-800 dark:text-white">{`${label}`}</p>
          <p className="intro text-cyan-600 dark:text-cyan-300">{`Progresso: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  const HabitTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-700 p-2 border border-slate-200 dark:border-slate-600 rounded shadow-lg">
          <p className="label text-slate-800 dark:text-white">{`${label}`}</p>
          <p className="intro text-pink-500 dark:text-pink-300">{`Conclusões: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-6 text-cyan-600 dark:text-cyan-300 border-b-2 border-cyan-500/30 dark:border-cyan-300/30 pb-2">Visão Geral do Progresso das Metas</h2>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700" style={{ height: '400px' }}>
          {goals.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalProgressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                <YAxis stroke={textColor} domain={[0, 100]} tick={{ fill: textColor }} unit="%" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(34, 211, 238, 0.1)' : 'rgba(6, 182, 212, 0.1)' }} />
                <Legend wrapperStyle={{ color: textColor }} />
                <Bar dataKey="progress" fill={isDark ? '#22d3ee' : '#0891b2'} name="Progresso (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
              Nenhum dado de meta para exibir. Crie uma meta para ver seu progresso aqui.
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-6 text-pink-500 dark:text-pink-400 border-b-2 border-pink-500/30 dark:border-pink-400/30 pb-2">Contagem de Conclusão de Hábitos</h2>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700" style={{ height: '400px' }}>
        {habits.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={habitCompletionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
              <YAxis stroke={textColor} allowDecimals={false} tick={{ fill: textColor }} />
              <Tooltip content={<HabitTooltip />} cursor={{ fill: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(219, 39, 119, 0.1)' }} />
              <Legend wrapperStyle={{ color: textColor }} />
              <Bar dataKey="completions" fill={isDark ? '#ec4899' : '#be185d'} name="Total de Conclusões" />
            </BarChart>
          </ResponsiveContainer>
           ) : (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
              Nenhum dado de hábito para exibir. Adicione alguns hábitos e acompanhe sua consistência.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;