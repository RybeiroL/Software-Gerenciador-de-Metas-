import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeSwitcherProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-800"
      aria-label={`Mudar para o tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeSwitcher;
