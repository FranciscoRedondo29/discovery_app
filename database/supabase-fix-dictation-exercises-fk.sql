-- Migration: Add foreign key constraint between dictation_metrics and exercises
-- Date: 2026-01-14
-- Purpose: Enable native joins between dictation_metrics and exercises in Supabase PostgREST

-- Step 1: Add foreign key constraint
-- This allows Supabase to recognize the relationship for join queries
ALTER TABLE dictation_metrics
DROP CONSTRAINT IF EXISTS dictation_metrics_exercise_id_fkey;

ALTER TABLE dictation_metrics
ADD CONSTRAINT dictation_metrics_exercise_id_fkey
FOREIGN KEY (exercise_id) 
REFERENCES exercises(id) 
ON DELETE SET NULL;

-- Step 2: Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_dictation_metrics_exercise_id 
ON dictation_metrics(exercise_id);

-- Step 3: Verify exercises table has proper RLS policies
-- Ensure authenticated users can read exercises
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Authenticated users can view exercises" ON exercises;
  
  -- Create the policy
  CREATE POLICY "Authenticated users can view exercises"
    ON exercises FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Comments for documentation
COMMENT ON CONSTRAINT dictation_metrics_exercise_id_fkey ON dictation_metrics 
IS 'Foreign key linking dictation metrics to exercises. Enables join queries and ensures referential integrity.';

-- Verification query (optional - run separately to verify)
-- SELECT COUNT(*) FROM dictation_metrics dm 
-- LEFT JOIN exercises e ON dm.exercise_id = e.id
-- WHERE dm.exercise_id IS NOT NULL;
