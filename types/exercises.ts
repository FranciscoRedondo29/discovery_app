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
 * Phrase interface for Reading Practice
 * Represents pre-defined phrases for reading exercises
 */
export interface Phrase {
  id: number;
  level: 'easy' | 'medium' | 'hard';
  text: string;
  syllables?: string;
}
