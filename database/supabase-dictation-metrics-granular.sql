
-- Migration: Add granular metrics to dictation_metrics table
-- Description: Adds columns for specific letter errors, structural errors, and detailed feedback arrays.

ALTER TABLE dictation_metrics
ADD COLUMN IF NOT EXISTS letter_omission_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS letter_insertion_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS letter_substitution_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS transposition_count NUMERIC(5,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS split_join_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS punctuation_error_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS capitalization_error_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_words TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resolution TEXT;

COMMENT ON COLUMN dictation_metrics.letter_omission_count IS 'Número de letras omitidas';
COMMENT ON COLUMN dictation_metrics.letter_insertion_count IS 'Número de letras inseridas indevidamente';
COMMENT ON COLUMN dictation_metrics.letter_substitution_count IS 'Número de letras substituídas';
COMMENT ON COLUMN dictation_metrics.transposition_count IS 'Número de transposições de letras (contabilizado em pares)';
COMMENT ON COLUMN dictation_metrics.split_join_count IS 'Total de erros de separação e junção indevida de palavras';
COMMENT ON COLUMN dictation_metrics.punctuation_error_count IS 'Número de erros de pontuação';
COMMENT ON COLUMN dictation_metrics.capitalization_error_count IS 'Número de erros de maiúsculas/minúsculas';
COMMENT ON COLUMN dictation_metrics.error_words IS 'Vetor com as palavras originais que tiveram erro';
COMMENT ON COLUMN dictation_metrics.resolution IS 'Frase que o aluno escreveu (redundante com transcript, mas solicitado)';
