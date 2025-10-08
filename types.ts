
import React from 'react';

export enum GoalStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum HabitFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  completion_date: string; 
}

export interface Habit {
  id: number;
  name: string;
  frequency: HabitFrequency;
  is_active: boolean;
  completions: HabitCompletion[];
  goal_ids: number[];
  current_streak: number;
}

export interface Goal {
  id: number;
  name: string;
  description: string;
  due_date: string | null;
  progress: number;
  status: GoalStatus;
  habit_ids: number[];
}

// Gamification Types
export type AchievementId = 'FIRST_HABIT' | 'FIVE_DAY_STREAK' | 'GOAL_CRUSHER' | 'LEVEL_TWO' | 'TEN_HABITS_COMPLETED';

export interface Achievement {
    id: AchievementId;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface GamificationData {
    level: number;
    points: number;
    experience: number;
    experienceToNextLevel: number;
    unlockedAchievements: Set<AchievementId>;
}
