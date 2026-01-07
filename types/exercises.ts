/**
 * Exercise interface for Learning Mode
 * Represents a sentence for students to read
 */
export interface Exercise {
  id: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

/**
 * Difficulty level types
 */
export type DifficultyEN = 'easy' | 'medium' | 'hard';
export type DifficultyPT = 'facil' | 'medio' | 'dificil';

/**
 * Difficulty labels in Portuguese for UI display
 */
export const DIFFICULTY_LABELS: Record<DifficultyPT, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

/**
 * Maps Portuguese difficulty values to English (Supabase values)
 */
export function difficultyPTtoEN(pt: DifficultyPT): DifficultyEN {
  const map: Record<DifficultyPT, DifficultyEN> = {
    facil: 'easy',
    medio: 'medium',
    dificil: 'hard',
  };
  return map[pt];
}

/**
 * Maps English difficulty values (Supabase) to Portuguese
 */
export function difficultyENtoPT(en: DifficultyEN): DifficultyPT {
  const map: Record<DifficultyEN, DifficultyPT> = {
    easy: 'facil',
    medium: 'medio',
    hard: 'dificil',
  };
  return map[en];
}

/**
 * Dictation metrics interface for database storage
 */
export interface DictationMetrics {
  id: string;
  student_id: string;
  exercise_id?: string | null;
  difficulty: DifficultyEN;
  correct_count: number;
  error_count: number;
  missing_count: number;
  extra_count: number;
  accuracy_percent: number;
  created_at: string;
}

/**
 * Payload for inserting dictation metrics
 */
export interface InsertDictationMetrics {
  studentId: string;
  exerciseId?: string | null;
  difficulty: DifficultyEN;
  correctCount: number;
  errorCount: number;
  missingCount: number;
  extraCount: number;
  accuracyPercent: number;
}

