import { supabase } from "@/lib/supabaseClient";
import { Exercise, InsertDictationMetrics } from "@/types/exercises";

/**
 * Fetches all exercises for a given difficulty level, ordered by number
 * 
 * @param difficulty - The difficulty level ('easy', 'medium', or 'hard')
 * @returns Array of exercises or empty array if none found
 * 
 * @example
 * const exercises = await getAllExercises('easy');
 */
export async function getAllExercises(
  difficulty: string
): Promise<Exercise[]> {
  try {
    // Validate difficulty input
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      console.error('Invalid difficulty level:', difficulty);
      return [];
    }

    // Query Supabase for all exercises matching the difficulty
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('difficulty', difficulty)
      .order('number', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }

    return (data || []) as Exercise[];
  } catch (err) {
    console.error('Unexpected error in getAllExercises:', err);
    return [];
  }
}

/**
 * Fetches exercises matching the given difficulty level, ordered by number
 * 
 * @param difficulty - The difficulty level ('easy', 'medium', or 'hard')
 * @param excludeIds - Array of exercise IDs to exclude (already seen)
 * @returns An exercise or null if none found
 * 
 * @example
 * const exercise = await getRandomExercise('easy', ['id1', 'id2']);
 * if (exercise) {
 *   console.log(exercise.content);
 * }
 */
export async function getRandomExercise(
  difficulty: string,
  excludeIds: string[] = []
): Promise<Exercise | null> {
  try {
    // Validate difficulty input
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      console.error('Invalid difficulty level:', difficulty);
      return null;
    }

    // Query Supabase for exercises matching the difficulty, ordered by number
    let query = supabase
      .from('exercises')
      .select('*')
      .eq('difficulty', difficulty)
      .order('number', { ascending: true });

    // Exclude already seen exercises
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn(`No exercises found for difficulty: ${difficulty}`);
      return null;
    }

    // Return the first exercise (lowest number not yet seen)
    return data[0] as Exercise;
  } catch (err) {
    console.error('Unexpected error in getRandomExercise:', err);
    return null;
  }
}

/**
 * Inserts dictation metrics into the database
 * 
 * @param metrics - The metrics to insert
 * @returns Success status and optional error message
 * 
 * @example
 * const result = await insertDictationMetrics({
 *   studentId: 'uuid',
 *   difficulty: 'medium',
 *   correctCount: 8,
 *   errorCount: 2,
 *   missingCount: 1,
 *   extraCount: 0,
 *   accuracyPercent: 85.5,
 *   exerciseId: 'exercise-uuid'
 * });
 */
export async function insertDictationMetrics(
  metrics: InsertDictationMetrics
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (!metrics.studentId) {
      console.error('Student ID is required');
      return { success: false, error: 'Student ID is required' };
    }

    if (!['easy', 'medium', 'hard'].includes(metrics.difficulty)) {
      console.error('Invalid difficulty level:', metrics.difficulty);
      return { success: false, error: 'Invalid difficulty level' };
    }

    // Insert into database
    const { error } = await supabase
      .from('dictation_metrics')
      .insert({
        student_id: metrics.studentId,
        exercise_id: metrics.exerciseId || null,
        difficulty: metrics.difficulty,
        correct_count: metrics.correctCount,
        error_count: metrics.errorCount,
        missing_count: metrics.missingCount,
        extra_count: metrics.extraCount,
        accuracy_percent: metrics.accuracyPercent,
        // Granular metrics
        letter_omission_count: metrics.letterOmissionCount ?? 0,
        letter_insertion_count: metrics.letterInsertionCount ?? 0,
        letter_substitution_count: metrics.letterSubstitutionCount ?? 0,
        transposition_count: metrics.transpositionCount ?? 0,
        split_join_count: metrics.splitJoinCount ?? 0,
        punctuation_error_count: metrics.punctuationErrorCount ?? 0,
        capitalization_error_count: metrics.capitalizationErrorCount ?? 0,
        error_words: metrics.errorWords ?? [],
        resolution: metrics.resolution ?? null,
      });

    if (error) {
      console.error('Error inserting dictation metrics:', error);
      return { success: false, error: error.message };
    }

    console.log('[insertDictationMetrics] Metrics saved successfully');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in insertDictationMetrics:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}


