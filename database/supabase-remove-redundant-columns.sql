-- Migration: Remove redundant columns from dictation_metrics table
-- Date: 2026-01-14
-- Removes: details, transcript (redundant with resolution), target_text

-- Remove the redundant columns
ALTER TABLE dictation_metrics
DROP COLUMN IF EXISTS details,
DROP COLUMN IF EXISTS transcript,
DROP COLUMN IF EXISTS target_text;

-- Add comments explaining what was removed
COMMENT ON TABLE dictation_metrics IS 'Armazena métricas de desempenho dos exercícios de ditado. Colunas details, transcript e target_text foram removidas por redundância (2026-01-14)';
