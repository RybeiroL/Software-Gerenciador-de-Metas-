import React from 'react';
import Modal from './Modal';
import { SparklesIcon, PlusCircleIcon } from './Icons';

interface HabitSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  onAddHabit: (habitName: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const HabitSuggestionModal: React.FC<HabitSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onAddHabit,
  isLoading,
  error,
  onRetry,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="text-pink-500 dark:text-pink-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sugestões de Hábitos da IA</h2>
        </div>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 dark:border-pink-400"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">A IA está pensando em novos hábitos para você...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center h-48 flex flex-col justify-center items-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="bg-pink-600 hover:bg-pink-700 transition-colors text-white font-semibold py-2 px-4 rounded-lg"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!isLoading && !error && suggestions.length > 0 && (
          <div>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Aqui estão algumas ideias para complementar sua rotina. Adicione as que gostar!</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg animate-fade-in-item" style={{ animationDelay: `${index * 100}ms` }}>
                  <p className="text-slate-800 dark:text-slate-200">{suggestion}</p>
                  <button
                    type="button"
                    onClick={() => onAddHabit(suggestion)}
                    className="flex items-center space-x-2 text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300 p-1 transition-colors"
                    title="Adicionar como novo hábito"
                  >
                    <PlusCircleIcon />
                    <span className="text-sm font-semibold">Adicionar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && suggestions.length === 0 && (
           <div className="text-center h-48 flex flex-col justify-center items-center">
             <p className="text-slate-500 dark:text-slate-400">Nenhuma sugestão nova no momento. Tente novamente mais tarde!</p>
           </div>
        )}

      </div>
      <style>{`
        @keyframes fade-in-item {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-item {
          animation: fade-in-item 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </Modal>
  );
};

export default HabitSuggestionModal;