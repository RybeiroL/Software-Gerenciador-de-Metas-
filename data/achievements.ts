
import { Achievement } from '../types';
import { TrophyIcon, FlameIcon, StarIcon, PlusCircleIcon } from '../components/Icons';

export const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'FIRST_HABIT',
        name: 'Primeiro Passo',
        description: 'Complete um hábito pela primeira vez.',
        icon: StarIcon,
    },
    {
        id: 'TEN_HABITS_COMPLETED',
        name: 'Consistência é a Chave',
        description: 'Complete 10 tarefas de hábitos no total.',
        icon: StarIcon,
    },
    {
        id: 'FIVE_DAY_STREAK',
        name: 'Em Chamas!',
        description: 'Mantenha uma sequência de 5 dias em qualquer hábito diário.',
        icon: FlameIcon,
    },
    {
        id: 'GOAL_CRUSHER',
        name: 'Conquistador de Metas',
        description: 'Conclua uma meta (100% de progresso).',
        icon: TrophyIcon,
    },
    {
        id: 'LEVEL_TWO',
        name: 'Subindo de Nível',
        description: 'Alcance o nível 2.',
        icon: PlusCircleIcon,
    },
];
