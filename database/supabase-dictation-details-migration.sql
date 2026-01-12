-- Migration: Add detailed metrics columns to dictation_metrics table
-- Description: Adds 'details' (JSONB) and 'transcript' (TEXT) columns to store
--              detailed dyslexia-specific error analysis and student input

-- Add details column to store the detailedDiff array from the evaluator
ALTER TABLE dictation_metrics
ADD COLUMN IF NOT EXISTS details JSONB;

-- Add transcript column to store the student's raw input
ALTER TABLE dictation_metrics
ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Add comment for documentation
COMMENT ON COLUMN dictation_metrics.details IS 'Detailed error analysis containing diff array with dyslexia-specific metrics';
COMMENT ON COLUMN dictation_metrics.transcript IS 'Raw student input text from dictation exercise';
