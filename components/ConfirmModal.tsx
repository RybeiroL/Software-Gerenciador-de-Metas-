import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-200 dark:border-slate-700 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold py-2 px-4 rounded-lg"
          >
            Excluir
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;