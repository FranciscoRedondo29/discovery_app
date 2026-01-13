/**
 * ========================================
 * READING MODE: Backend Functions
 * ========================================
 * 
 * Server-side functions for reading mode exercises
 * - Fetch next exercise (deterministic, sequential)
 * - Track progress (completed exercises)
 * - Store metrics (performance analytics)
 * 
 * IMPORTANT: Frontend must remain unchanged
 * These functions support the existing UI behavior
 * ========================================
 */

import { supabase } from "@/lib/supabaseClient";
import type { 
  ReadingExercise, 
  ReadingProgress,
  ReadingProgressSummary,
  InsertReadingMetrics,
  WordTiming
} from "@/types/exercises";

// ========================================
// 1. EXERCISE FETCHING
// ========================================

/**
 * Fetch the next reading exercise for a student at a specific difficulty
 * Returns exercises in deterministic sequential order (by number)
 * Excludes exercises already completed by the student
 * 
 * @param studentId - UUID of the student
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @returns Next exercise or null if all completed
 * 
 * @example
 * const exercise = await getNextReadingExercise(userId, 'easy');
 * if (exercise) {
 *   console.log(exercise.text); // "A lua."
 * }
 */
export async function getNextReadingExercise(
  studentId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<ReadingExercise | null> {
  try {
    // Validate input
    if (!studentId) {
      console.error('[getNextReadingExercise] Missing studentId');
      return null;
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      console.error('[getNextReadingExercise] Invalid difficulty:', difficulty);
      return null;
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('get_next_reading_exercise', {
      p_student_id: studentId,
      p_difficulty: difficulty
    });

    if (error) {
      console.error('[getNextReadingExercise] RPC error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`[getNextReadingExercise] No more exercises for ${difficulty}`);
      return null;
    }

    // Return first result (RPC returns array)
    const exercise = data[0];
    
    // Transform database format to frontend format
    return {
      id: exercise.id,
      number: exercise.number,
      difficulty: exercise.difficulty,
      text: exercise.text,
      audioFile: exercise.audio_file,
      wordTimings: exercise.word_timings as WordTiming[],
      syllables: exercise.syllables
    };
  } catch (err) {
    console.error('[getNextReadingExercise] Unexpected error:', err);
    return null;
  }
}

/**
 * Fetch a specific reading exercise by ID
 * Useful for replaying or reviewing specific exercises
 * 
 * @param exerciseId - UUID of the exercise
 * @returns Exercise or null if not found
 */
export async function getReadingExerciseById(
  exerciseId: string
): Promise<ReadingExercise | null> {
  try {
    const { data, error } = await supabase
      .from('reading_exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) {
      console.error('[getReadingExerciseById] Error:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      number: data.number,
      difficulty: data.difficulty,
      text: data.text,
      audioFile: data.audio_file,
      wordTimings: data.word_timings as WordTiming[],
      syllables: data.syllables
    };
  } catch (err) {
    console.error('[getReadingExerciseById] Unexpected error:', err);
    return null;
  }
}

/**
 * Fetch all reading exercises for a specific difficulty level
 * Returns exercises ordered by number (sequential)
 * 
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @returns Array of exercises
 */
export async function getAllReadingExercises(
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<ReadingExercise[]> {
  try {
    const { data, error } = await supabase
      .from('reading_exercises')
      .select('*')
      .eq('difficulty', difficulty)
      .order('number', { ascending: true });

    if (error) {
      console.error('[getAllReadingExercises] Error:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(exercise => ({
      id: exercise.id,
      number: exercise.number,
      difficulty: exercise.difficulty,
      text: exercise.text,
      audioFile: exercise.audio_file,
      wordTimings: exercise.word_timings as WordTiming[],
      syllables: exercise.syllables
    }));
  } catch (err) {
    console.error('[getAllReadingExercises] Unexpected error:', err);
    return [];
  }
}

// ========================================
// 2. PROGRESS TRACKING
// ========================================

/**
 * Mark a reading exercise as completed by a student
 * Creates a progress record in the database
 * Idempotent: won't create duplicates if already marked
 * 
 * @param studentId - UUID of the student
 * @param exerciseId - UUID of the exercise
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @returns Success status
 * 
 * @example
 * await markReadingExerciseComplete(userId, exerciseId, 'easy');
 */
export async function markReadingExerciseComplete(
  studentId: string,
  exerciseId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (!studentId || !exerciseId) {
      return { success: false, error: 'Missing required parameters' };
    }

    // Check if already marked complete (prevent duplicates)
    const { data: existing } = await supabase
      .from('reading_progress')
      .select('id')
      .eq('student_id', studentId)
      .eq('exercise_id', exerciseId)
      .single();

    if (existing) {
      // Already marked complete, that's fine
      return { success: true };
    }

    // Insert progress record
    const { error } = await supabase
      .from('reading_progress')
      .insert({
        student_id: studentId,
        exercise_id: exerciseId,
        difficulty: difficulty
      });

    if (error) {
      console.error('[markReadingExerciseComplete] Error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[markReadingExerciseComplete] Marked ${exerciseId} complete for ${studentId}`);
    return { success: true };
  } catch (err) {
    console.error('[markReadingExerciseComplete] Unexpected error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Get progress summary for a student at a specific difficulty
 * Returns total exercises, completed count, and progress percentage
 * 
 * @param studentId - UUID of the student
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @returns Progress summary
 * 
 * @example
 * const summary = await getReadingProgressSummary(userId, 'easy');
 * console.log(`${summary.completed_exercises}/${summary.total_exercises}`);
 */
export async function getReadingProgressSummary(
  studentId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<ReadingProgressSummary | null> {
  try {
    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('get_reading_progress_summary', {
      p_student_id: studentId,
      p_difficulty: difficulty
    });

    if (error) {
      console.error('[getReadingProgressSummary] RPC error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        total_exercises: 0,
        completed_exercises: 0,
        next_exercise_number: 1,
        progress_percent: 0
      };
    }

    return data[0];
  } catch (err) {
    console.error('[getReadingProgressSummary] Unexpected error:', err);
    return null;
  }
}

/**
 * Get all completed exercise IDs for a student at a specific difficulty
 * Useful for rendering progress dots on frontend
 * 
 * @param studentId - UUID of the student
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @returns Array of completed exercise IDs
 */
export async function getCompletedExerciseIds(
  studentId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('exercise_id')
      .eq('student_id', studentId)
      .eq('difficulty', difficulty);

    if (error) {
      console.error('[getCompletedExerciseIds] Error:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(record => record.exercise_id);
  } catch (err) {
    console.error('[getCompletedExerciseIds] Unexpected error:', err);
    return [];
  }
}

/**
 * Reset all progress for a student at a specific difficulty level
 * Deletes all progress records, allowing fresh start
 * 
 * @param studentId - UUID of the student
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @returns Success status
 * 
 * @example
 * await resetReadingProgress(userId, 'easy'); // Start over
 */
export async function resetReadingProgress(
  studentId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call Supabase RPC function (includes security check)
    const { data, error } = await supabase.rpc('reset_reading_progress', {
      p_student_id: studentId,
      p_difficulty: difficulty
    });

    if (error) {
      console.error('[resetReadingProgress] RPC error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[resetReadingProgress] Reset progress for ${studentId} at ${difficulty}`);
    return { success: true };
  } catch (err) {
    console.error('[resetReadingProgress] Unexpected error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

// ========================================
// 3. METRICS & ANALYTICS
// ========================================

/**
 * Insert reading session metrics into the database
 * Stores performance data for analytics and tracking
 * 
 * @param metrics - Reading session metrics
 * @returns Success status
 * 
 * @example
 * await insertReadingMetrics({
 *   studentId: userId,
 *   exerciseId: exerciseId,
 *   difficulty: 'easy',
 *   playbackCount: 3,
 *   timeSpentSeconds: 45,
 *   playbackSpeed: 1.0,
 *   syllableModeUsed: false
 * });
 */
export async function insertReadingMetrics(
  metrics: InsertReadingMetrics
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (!metrics.studentId || !metrics.exerciseId) {
      return { success: false, error: 'Missing required fields' };
    }

    if (!['easy', 'medium', 'hard'].includes(metrics.difficulty)) {
      return { success: false, error: 'Invalid difficulty level' };
    }

    // Insert into database
    const { error } = await supabase
      .from('reading_metrics')
      .insert({
        student_id: metrics.studentId,
        exercise_id: metrics.exerciseId,
        difficulty: metrics.difficulty,
        playback_count: metrics.playbackCount ?? 0,
        time_spent_seconds: metrics.timeSpentSeconds ?? null,
        accuracy_percent: metrics.accuracyPercent ?? null,
        playback_speed: metrics.playbackSpeed ?? 1.0,
        syllable_mode_used: metrics.syllableModeUsed ?? false,
        session_data: metrics.sessionData ?? null
      });

    if (error) {
      console.error('[insertReadingMetrics] Error:', error);
      return { success: false, error: error.message };
    }

    console.log('[insertReadingMetrics] Metrics saved successfully');
    return { success: true };
  } catch (err) {
    console.error('[insertReadingMetrics] Unexpected error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Get reading metrics for a student (filtered by difficulty or all)
 * Useful for analytics dashboard or progress reports
 * 
 * @param studentId - UUID of the student
 * @param difficulty - Optional difficulty filter
 * @param limit - Maximum number of records to return
 * @returns Array of metrics records
 */
export async function getReadingMetrics(
  studentId: string,
  difficulty?: 'easy' | 'medium' | 'hard',
  limit: number = 50
): Promise<any[]> {
  try {
    let query = supabase
      .from('reading_metrics')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getReadingMetrics] Error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[getReadingMetrics] Unexpected error:', err);
    return [];
  }
}

// ========================================
// 4. COMBINED OPERATIONS
// ========================================

/**
 * Complete workflow: Mark exercise complete + store metrics
 * Call this when a student finishes an exercise
 * 
 * @param studentId - UUID of the student
 * @param exerciseId - UUID of the exercise
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @param metrics - Optional session metrics
 * @returns Success status
 * 
 * @example
 * await completeReadingExercise(userId, exerciseId, 'easy', {
 *   playbackCount: 2,
 *   timeSpentSeconds: 30
 * });
 */
export async function completeReadingExercise(
  studentId: string,
  exerciseId: string,
  difficulty: 'easy' | 'medium' | 'hard',
  metrics?: Partial<InsertReadingMetrics>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Mark as complete
    const progressResult = await markReadingExerciseComplete(
      studentId,
      exerciseId,
      difficulty
    );

    if (!progressResult.success) {
      return progressResult;
    }

    // 2. Store metrics (if provided)
    if (metrics) {
      const metricsResult = await insertReadingMetrics({
        studentId,
        exerciseId,
        difficulty,
        ...metrics
      });

      if (!metricsResult.success) {
        // Progress was saved but metrics failed
        console.warn('[completeReadingExercise] Metrics failed but progress saved');
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[completeReadingExercise] Unexpected error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
