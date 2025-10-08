import { GoogleGenAI, Type } from "@google/genai";
import { Habit } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Chave da API Gemini não encontrada. Os recursos de IA serão desativados. Por favor, configure process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getDailyQuote = async (): Promise<string> => {
    if (!API_KEY) {
      // Retorna uma citação padrão se a chave da API não estiver disponível
      return "A jornada de mil milhas começa com um único passo.";
    }
    
    try {
      const prompt = "Gere uma frase motivacional curta, única e impactante, com no máximo 20 palavras. Evite clichês comuns. A resposta deve ser apenas a frase, sem aspas ou texto adicional.";
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
  
      const quote = response.text.trim();
      if (quote) {
        // remove aspas se o modelo as adicionar de qualquer maneira
        return quote.replace(/^"|"$/g, '');
      }
      throw new Error("A IA retornou uma resposta vazia.");
  
    } catch (error) {
      console.error("Erro ao obter citação diária do Gemini:", error);
      // Citação de fallback em caso de erro da API
      return "A persistência realiza o impossível.";
    }
  };

export const suggestHabits = async (goalName: string, goalDescription: string): Promise<string[]> => {
  if (!API_KEY) {
    // Return mock data if API key is not available
    return new Promise(resolve => setTimeout(() => resolve([
        `Revisar o progresso de '${goalName}' semanalmente`,
        `Dividir '${goalName}' em tarefas menores`,
        `Dedicar 1 hora por dia para '${goalName}'`,
    ]), 1000));
  }
  
  try {
    const prompt = `Com base na seguinte meta, sugira de 3 a 5 hábitos pequenos e práticos. A meta é: "${goalName}". Descrição: "${goalDescription}". Os hábitos devem ser concisos e fáceis de começar.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            habits: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A single, actionable habit suggestion."
              }
            }
          }
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.habits)) {
      return result.habits;
    }
    return [];
  } catch (error) {
    console.error("Error suggesting habits with Gemini:", error);
    throw new Error("Falha ao obter sugestões da IA. Por favor, tente novamente.");
  }
};

export const suggestNewHabitsBasedOnExisting = async (existingHabits: Habit[]): Promise<string[]> => {
    if (!API_KEY) {
        return new Promise(resolve => setTimeout(() => resolve([
            `Alongamento pós-corrida`,
            `Treino de força 2x por semana`,
            `Beber 2L de água por dia`,
        ]), 1000));
    }
    
    const habitNames = existingHabits.map(h => h.name).join(', ');

    try {
        const prompt = `Com base na lista de hábitos atual do usuário, sugira de 3 a 5 hábitos novos e complementares que se encaixem bem em sua rotina.
    Hábitos existentes: "${habitNames}".
    As sugestões devem ser distintas dos hábitos existentes, concisas e práticas.
    Por exemplo, se um usuário tem "Correr 5km", sugira "Alongamento pós-corrida" ou "Treino de fortalecimento para corredores".`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        habits: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "Uma única sugestão de hábito prático."
                            }
                        }
                    }
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (result && Array.isArray(result.habits)) {
            const existingHabitNamesLower = existingHabits.map(h => h.name.toLowerCase());
            return result.habits.filter((suggestion: string) => !existingHabitNamesLower.includes(suggestion.toLowerCase()));
        }
        return [];
    } catch (error) {
        console.error("Error suggesting new habits with Gemini:", error);
        throw new Error("Falha ao obter sugestões da IA. Por favor, tente novamente.");
    }
};