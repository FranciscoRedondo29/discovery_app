-- Migration: Add foreign key constraint and fix RLS for exercises table
-- Date: 2026-01-14
-- Fixes the relationship between dictation_metrics and exercises

-- Step 1: Add foreign key constraint to dictation_metrics.exercise_id
ALTER TABLE dictation_metrics
DROP CONSTRAINT IF EXISTS fk_dictation_metrics_exercise_id;

ALTER TABLE dictation_metrics
ADD CONSTRAINT fk_dictation_metrics_exercise_id
FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL;

-- Step 2: Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_dictation_metrics_exercise_id ON dictation_metrics(exercise_id);

-- Step 3: Ensure exercises table has RLS enabled and proper policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;

-- Create policy: All authenticated users can view exercises
CREATE POLICY "Authenticated users can view exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Allow public read access if needed (uncomment if exercises should be public)
-- CREATE POLICY "Public can view exercises"
--   ON exercises FOR SELECT
--   TO anon
--   USING (true);

COMMENT ON CONSTRAINT fk_dictation_metrics_exercise_id ON dictation_metrics IS 'Foreign key linking dictation metrics to exercises for accurate tracking and reporting';
