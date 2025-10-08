import React, { useState, useEffect } from 'react';
import { getDailyQuote } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface DailyQuote {
    quote: string;
    date: string;
}

const Inspiration: React.FC = () => {
    const [dailyQuote, setDailyQuote] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuote = async () => {
            setIsLoading(true);
            setError(null);
            const today = new Date().toISOString().split('T')[0];
            
            try {
                const storedData = localStorage.getItem('dailyQuote');
                if (storedData) {
                    const parsedData: DailyQuote = JSON.parse(storedData);
                    if (parsedData.date === today && parsedData.quote) {
                        setDailyQuote(parsedData.quote);
                        setIsLoading(false);
                        return;
                    }
                }

                // Se não houver citação armazenada ou estiver desatualizada, busca uma nova
                const newQuote = await getDailyQuote();
                setDailyQuote(newQuote);
                localStorage.setItem('dailyQuote', JSON.stringify({ quote: newQuote, date: today }));

            } catch (e) {
                console.error("Falha ao buscar ou processar a citação diária:", e);
                setError("Não foi possível carregar a inspiração de hoje.");
                // Fornece uma citação de fallback em caso de erro
                setDailyQuote("Acredite em você e tudo será possível.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuote();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-slate-400 dark:text-slate-500 italic">Carregando inspiração...</p>;
        }
        if (error && !dailyQuote) { // Mostra erro apenas se não houver citação de fallback
             return <p className="text-red-400">{error}</p>;
        }
        if (dailyQuote) {
            return <blockquote className="text-lg italic text-slate-700 dark:text-slate-300">"{dailyQuote}"</blockquote>;
        }
        return null;
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700 text-center transition-colors duration-300">
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center justify-center gap-2">
                <SparklesIcon className="h-5 w-5"/>
                Inspiração do Dia
            </h3>
            {renderContent()}
        </div>
    );
};

export default Inspiration;