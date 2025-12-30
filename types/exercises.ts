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
