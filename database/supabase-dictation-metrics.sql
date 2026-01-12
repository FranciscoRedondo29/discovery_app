-- Tabela para guardar métricas de exercícios de ditado
-- Criada em: 2026-01-07

CREATE TABLE IF NOT EXISTS dictation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NULL, -- Referência ao exercício realizado (opcional)
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0),
  error_count INTEGER NOT NULL CHECK (error_count >= 0),
  missing_count INTEGER NOT NULL CHECK (missing_count >= 0),
  extra_count INTEGER NOT NULL CHECK (extra_count >= 0),
  accuracy_percent NUMERIC(5,2) NOT NULL CHECK (accuracy_percent >= 0 AND accuracy_percent <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_dictation_metrics_student_id ON dictation_metrics(student_id);
CREATE INDEX IF NOT EXISTS idx_dictation_metrics_created_at ON dictation_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dictation_metrics_difficulty ON dictation_metrics(difficulty);

-- Habilitar Row Level Security (RLS)
ALTER TABLE dictation_metrics ENABLE ROW LEVEL SECURITY;

-- Política: Utilizadores autenticados podem inserir as suas próprias métricas
CREATE POLICY "Users can insert own metrics"
  ON dictation_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Política: Utilizadores podem ver apenas as suas próprias métricas
CREATE POLICY "Users can view own metrics"
  ON dictation_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Comentários para documentação
COMMENT ON TABLE dictation_metrics IS 'Armazena métricas de desempenho dos exercícios de ditado realizados por alunos';
COMMENT ON COLUMN dictation_metrics.student_id IS 'ID do aluno que realizou o exercício';
COMMENT ON COLUMN dictation_metrics.exercise_id IS 'ID do exercício realizado (opcional)';
COMMENT ON COLUMN dictation_metrics.difficulty IS 'Nível de dificuldade: easy, medium ou hard';
COMMENT ON COLUMN dictation_metrics.correct_count IS 'Número de palavras corretas';
COMMENT ON COLUMN dictation_metrics.error_count IS 'Número de erros de substituição';
COMMENT ON COLUMN dictation_metrics.missing_count IS 'Número de palavras em falta (omissão)';
COMMENT ON COLUMN dictation_metrics.extra_count IS 'Número de palavras extras (inserção)';
COMMENT ON COLUMN dictation_metrics.accuracy_percent IS 'Percentagem de acerto (0-100)';
