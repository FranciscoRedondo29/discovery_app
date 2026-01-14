-- Migration: Add target_text column to dictation_metrics table
-- Description: Stores the original phrase text that the student was supposed to write
--              This allows comparison between the target phrase and the student's resolution

ALTER TABLE dictation_metrics
ADD COLUMN IF NOT EXISTS target_text TEXT;

COMMENT ON COLUMN dictation_metrics.target_text IS 'Original phrase text that the student was supposed to write (from exercises.content or phrases.text)';
