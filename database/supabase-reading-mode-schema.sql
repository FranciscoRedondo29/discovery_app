-- ========================================
-- READING MODE: Database Schema
-- ========================================
-- Purpose: Support reading exercises with deterministic progression,
--          progress tracking per student/difficulty, and metrics storage
-- Compatible with existing frontend UI (no breaking changes)
-- ========================================

-- --------------------------------------
-- 1. READING_EXERCISES TABLE
-- --------------------------------------
-- Stores reading exercises with audio metadata
-- Replaces hardcoded PHRASES array with database-driven content
CREATE TABLE IF NOT EXISTS reading_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Exercise properties
  number INTEGER NOT NULL,  -- Sequential number per difficulty (1, 2, 3...)
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  text TEXT NOT NULL,  -- The sentence to read (e.g., "A lua.")
  
  -- Audio metadata
  audio_file TEXT NOT NULL,  -- Path to sentence audio (e.g., "/audios/A lua.m4a")
  word_timings JSONB NOT NULL DEFAULT '[]',  -- Array of {word, start, end} for highlighting
  syllables TEXT,  -- Optional syllable breakdown (e.g., "A lu-a.")
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_number_difficulty UNIQUE (number, difficulty)
);

-- Index for efficient queries by difficulty + number
CREATE INDEX IF NOT EXISTS idx_reading_exercises_difficulty_number 
  ON reading_exercises(difficulty, number);

-- Enable Row Level Security
ALTER TABLE reading_exercises ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view reading exercises
CREATE POLICY "Authenticated users can view reading exercises"
  ON reading_exercises FOR SELECT
  TO authenticated
  USING (true);

-- --------------------------------------
-- 2. READING_PROGRESS TABLE
-- --------------------------------------
-- Tracks which exercises each student has completed per difficulty
-- Enables deterministic "next exercise" logic and progress dots
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  student_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES reading_exercises(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Status
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate completions
  CONSTRAINT unique_student_exercise UNIQUE (student_id, exercise_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_reading_progress_student_difficulty 
  ON reading_progress(student_id, difficulty);

CREATE INDEX IF NOT EXISTS idx_reading_progress_student 
  ON reading_progress(student_id);

-- Enable Row Level Security
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only view/insert their own progress
CREATE POLICY "Students can view their own reading progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own reading progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Profissionais can view progress of linked students
CREATE POLICY "Profissionais can view linked students reading progress"
  ON reading_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM aluno_profissionais
      WHERE aluno_profissionais.aluno_id = reading_progress.student_id
      AND aluno_profissionais.profissional_id = auth.uid()
    )
  );

-- --------------------------------------
-- 3. READING_METRICS TABLE
-- --------------------------------------
-- Stores detailed metrics from reading sessions
-- Tracks accuracy, time spent, and performance analytics
CREATE TABLE IF NOT EXISTS reading_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  student_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES reading_exercises(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Timing metrics
  playback_count INTEGER DEFAULT 0,  -- How many times "Reproduzir" was clicked
  time_spent_seconds INTEGER,  -- Total time on exercise
  
  -- Performance metrics (if reading comprehension features are added later)
  accuracy_percent DECIMAL(5, 2),  -- Future: reading accuracy score
  
  -- Session metadata
  playback_speed DECIMAL(3, 2) DEFAULT 1.0,  -- Speed setting used (0.5-1.5)
  syllable_mode_used BOOLEAN DEFAULT false,  -- Whether syllable division was enabled
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_data JSONB  -- Additional session details (flexible for future needs)
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_reading_metrics_student_difficulty 
  ON reading_metrics(student_id, difficulty);

CREATE INDEX IF NOT EXISTS idx_reading_metrics_student 
  ON reading_metrics(student_id);

CREATE INDEX IF NOT EXISTS idx_reading_metrics_created_at 
  ON reading_metrics(created_at);

-- Enable Row Level Security
ALTER TABLE reading_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only view/insert their own metrics
CREATE POLICY "Students can view their own reading metrics"
  ON reading_metrics FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own reading metrics"
  ON reading_metrics FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Profissionais can view metrics of linked students
CREATE POLICY "Profissionais can view linked students reading metrics"
  ON reading_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM aluno_profissionais
      WHERE aluno_profissionais.aluno_id = reading_metrics.student_id
      AND aluno_profissionais.profissional_id = auth.uid()
    )
  );

-- --------------------------------------
-- 4. HELPER FUNCTIONS
-- --------------------------------------

-- Function: Get next reading exercise for a student
-- Returns the next exercise in sequence that hasn't been completed
CREATE OR REPLACE FUNCTION get_next_reading_exercise(
  p_student_id UUID,
  p_difficulty TEXT
)
RETURNS TABLE (
  id UUID,
  number INTEGER,
  difficulty TEXT,
  text TEXT,
  audio_file TEXT,
  word_timings JSONB,
  syllables TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate difficulty
  IF p_difficulty NOT IN ('easy', 'medium', 'hard') THEN
    RAISE EXCEPTION 'Invalid difficulty: %', p_difficulty;
  END IF;

  -- Return first exercise not yet completed by student
  RETURN QUERY
  SELECT 
    re.id,
    re.number,
    re.difficulty,
    re.text,
    re.audio_file,
    re.word_timings,
    re.syllables
  FROM reading_exercises re
  WHERE re.difficulty = p_difficulty
    AND NOT EXISTS (
      SELECT 1 FROM reading_progress rp
      WHERE rp.student_id = p_student_id
        AND rp.exercise_id = re.id
    )
  ORDER BY re.number ASC
  LIMIT 1;
END;
$$;

-- Function: Get reading progress summary for a student
-- Returns total exercises and completed count per difficulty
CREATE OR REPLACE FUNCTION get_reading_progress_summary(
  p_student_id UUID,
  p_difficulty TEXT
)
RETURNS TABLE (
  total_exercises INTEGER,
  completed_exercises INTEGER,
  next_exercise_number INTEGER,
  progress_percent DECIMAL(5, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_next_number INTEGER;
BEGIN
  -- Get total exercises for difficulty
  SELECT COUNT(*)::INTEGER INTO v_total
  FROM reading_exercises
  WHERE difficulty = p_difficulty;

  -- Get completed count
  SELECT COUNT(*)::INTEGER INTO v_completed
  FROM reading_progress rp
  JOIN reading_exercises re ON rp.exercise_id = re.id
  WHERE rp.student_id = p_student_id
    AND re.difficulty = p_difficulty;

  -- Get next exercise number
  SELECT MIN(re.number)::INTEGER INTO v_next_number
  FROM reading_exercises re
  WHERE re.difficulty = p_difficulty
    AND NOT EXISTS (
      SELECT 1 FROM reading_progress rp
      WHERE rp.student_id = p_student_id
        AND rp.exercise_id = re.id
    );

  RETURN QUERY
  SELECT 
    v_total,
    v_completed,
    COALESCE(v_next_number, v_total + 1),  -- If all done, return total+1
    CASE 
      WHEN v_total > 0 THEN ROUND((v_completed::DECIMAL / v_total * 100), 2)
      ELSE 0
    END;
END;
$$;

-- Function: Reset reading progress for a student (for specific difficulty)
-- Allows students to restart a difficulty level
CREATE OR REPLACE FUNCTION reset_reading_progress(
  p_student_id UUID,
  p_difficulty TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that the caller is the student
  IF auth.uid() != p_student_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only reset own progress';
  END IF;

  -- Validate difficulty
  IF p_difficulty NOT IN ('easy', 'medium', 'hard') THEN
    RAISE EXCEPTION 'Invalid difficulty: %', p_difficulty;
  END IF;

  -- Delete progress entries for this difficulty
  DELETE FROM reading_progress
  WHERE student_id = p_student_id
    AND difficulty = p_difficulty;

  RETURN TRUE;
END;
$$;

-- --------------------------------------
-- 5. SEED DATA (Migration from phrases.ts)
-- --------------------------------------
-- Insert existing phrases from your hardcoded array
-- This preserves all current functionality while moving to DB

-- Easy exercises (11 frases)
INSERT INTO reading_exercises (number, difficulty, text, audio_file, word_timings, syllables) VALUES
  (1, 'easy', 'A lua.', '/audios/A lua.m4a', 
   '[{"word":"A","start":0,"end":1.0},{"word":"lua.","start":1.0,"end":2}]', 'A lu-a.'),
  
  (2, 'easy', 'O pai pega no pão.', '/audios/O pai pega no pão.m4a',
   '[{"word":"O","start":0,"end":0.8},{"word":"pai","start":0.8,"end":1.7},{"word":"pega","start":1.7,"end":3.0},{"word":"no","start":3.0,"end":3.8},{"word":"pão.","start":3.8,"end":4.9}]', 
   'O pai pe-ga no pão.'),
  
  (3, 'easy', 'A bola é do Pedro.', '/audios/A bola é do Pedro.m4a',
   '[{"word":"A","start":0,"end":0.6},{"word":"bola","start":0.6,"end":1.8},{"word":"é","start":1.8,"end":2.4},{"word":"do","start":2.4,"end":3.5},{"word":"Pedro.","start":3.5,"end":5.4}]',
   'A bo-la é do Pe-dro.')
-- Add more as needed...
ON CONFLICT (number, difficulty) DO NOTHING;

-- Note: Full seed data should include all phrases from phrases.ts
-- This is a sample showing the structure

-- --------------------------------------
-- 6. COMMENTS & DOCUMENTATION
-- --------------------------------------

COMMENT ON TABLE reading_exercises IS 'Stores reading exercises with audio metadata for sequential reading practice';
COMMENT ON TABLE reading_progress IS 'Tracks completed reading exercises per student to enable deterministic progression';
COMMENT ON TABLE reading_metrics IS 'Stores performance metrics and analytics from reading sessions';

COMMENT ON FUNCTION get_next_reading_exercise IS 'Returns the next uncompleted exercise in sequential order for a student/difficulty';
COMMENT ON FUNCTION get_reading_progress_summary IS 'Returns progress statistics for a student at a specific difficulty level';
COMMENT ON FUNCTION reset_reading_progress IS 'Resets all progress for a student at a specific difficulty level';
