import { supabase } from "@/lib/supabaseClient";
import { Exercise } from "@/types/exercises";

/**
 * Fetches a random exercise matching the given difficulty level
 * 
 * @param difficulty - The difficulty level ('easy', 'medium', or 'hard')
 * @returns A random exercise or null if none found
 * 
 * @example
 * const exercise = await getRandomExercise('easy');
 * if (exercise) {
 *   console.log(exercise.content);
 * }
 */
export async function getRandomExercise(
  difficulty: string
): Promise<Exercise | null> {
  try {
    // Validate difficulty input
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      console.error('Invalid difficulty level:', difficulty);
      return null;
    }

    // Query Supabase for all exercises matching the difficulty
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('difficulty', difficulty);

    if (error) {
      console.error('Error fetching exercises:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn(`No exercises found for difficulty: ${difficulty}`);
      return null;
    }

    // Pick a random exercise from the results
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex] as Exercise;
  } catch (err) {
    console.error('Unexpected error in getRandomExercise:', err);
    return null;
  }
}

/**
 * Alternative implementation using PostgreSQL's random() function
 * More efficient for large datasets as it randomizes server-side
 * 
 * Note: Requires enabling the 'order by random()' feature in Supabase
 */
export async function getRandomExerciseOptimized(
  difficulty: string
): Promise<Exercise | null> {
  try {
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      console.error('Invalid difficulty level:', difficulty);
      return null;
    }

    // Use PostgreSQL's random() function with limit 1
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('difficulty', difficulty)
      .limit(1)
      .order('id', { ascending: false }); // Note: random ordering may need RPC function

    if (error) {
      console.error('Error fetching exercise:', error);
      return null;
    }

    return data && data.length > 0 ? (data[0] as Exercise) : null;
  } catch (err) {
    console.error('Unexpected error in getRandomExerciseOptimized:', err);
    return null;
  }
}
