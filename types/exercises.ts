/**
 * Exercise interface for Learning Mode
 * Represents a sentence for students to read
 */
export interface Exercise {
  id: string;
  number: number;
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
  details?: any; // Detailed diff array with dyslexia-specific error analysis
  transcript?: string; // Raw student input text
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
  // Granular metrics
  letterOmissionCount?: number;
  letterInsertionCount?: number;
  letterSubstitutionCount?: number;
  transpositionCount?: number;
  splitJoinCount?: number;
  punctuationErrorCount?: number;
  capitalizationErrorCount?: number;
  errorWords?: string[];
  resolution?: string;
  details?: any; // Detailed diff array with dyslexia-specific error analysis
  transcript?: string; // Raw student input text
}


/**
 * Word timing for audio synchronization
 */
export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

/**
 * Phrase interface for Reading Practice
 * Represents pre-defined phrases for reading exercises
 */
export interface Phrase {
  id: number;
  level: 'easy' | 'medium' | 'hard';
  text: string;
  syllables?: string;
  audioFile?: string;
  wordTimings?: WordTiming[];
}

// ========================================
// READING MODE TYPES
// ========================================

/**
 * Reading exercise from database
 * Compatible with frontend Phrase interface but uses UUID
 */
export interface ReadingExercise {
  id: string;  // UUID from database
  number: number;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  audioFile: string;
  wordTimings: WordTiming[];
  syllables?: string;
}

/**
 * Reading progress entry
 * Tracks which exercises a student has completed
 */
export interface ReadingProgress {
  id: string;
  student_id: string;
  exercise_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed_at: string;
}

/**
 * Reading progress summary
 * Overview of student progress at a specific difficulty
 */
export interface ReadingProgressSummary {
  total_exercises: number;
  completed_exercises: number;
  next_exercise_number: number;
  progress_percent: number;
}

/**
 * Reading metrics payload for insertion
 */
export interface InsertReadingMetrics {
  studentId: string;
  exerciseId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playbackCount?: number;
  timeSpentSeconds?: number;
  accuracyPercent?: number;
  playbackSpeed?: number;
  syllableModeUsed?: boolean;
  sessionData?: Record<string, any>;
}

/**
 * Reading metrics database record
 */
export interface ReadingMetrics {
  id: string;
  student_id: string;
  exercise_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playback_count: number;
  time_spent_seconds?: number;
  accuracy_percent?: number;
  playback_speed: number;
  syllable_mode_used: boolean;
  session_data?: Record<string, any>;
  created_at: string;
}