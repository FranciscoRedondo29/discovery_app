-- Supabase Database Schema for Discovery MVP
-- Run this SQL in your Supabase SQL Editor

-- Table: alunos (Students)
CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  escola_instituicao TEXT NOT NULL,
  ano_escolaridade INTEGER NOT NULL CHECK (ano_escolaridade >= 1 AND ano_escolaridade <= 12),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: profissionais (Professionals)
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  escola_instituicao TEXT NOT NULL,
  funcao TEXT NOT NULL CHECK (funcao IN ('Psicólogo(a)', 'Terapeuta da fala', 'Professor(a)', 'Outro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alunos table
-- Users can insert their own row
CREATE POLICY "Users can insert their own aluno profile"
  ON alunos FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can select their own row
CREATE POLICY "Users can view their own aluno profile"
  ON alunos FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own row
CREATE POLICY "Users can update their own aluno profile"
  ON alunos FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for profissionais table
-- Users can insert their own row
CREATE POLICY "Users can insert their own profissional profile"
  ON profissionais FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can select their own row
CREATE POLICY "Users can view their own profissional profile"
  ON profissionais FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own row
CREATE POLICY "Users can update their own profissional profile"
  ON profissionais FOR UPDATE
  USING (auth.uid() = id);

-- Migration: Add nome and funcao columns to existing tables
-- Run this if tables already exist without these columns
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS funcao TEXT;

-- Update existing rows with default values (if any)
UPDATE alunos SET nome = '' WHERE nome IS NULL;
UPDATE profissionais SET nome = '' WHERE nome IS NULL;
UPDATE profissionais SET funcao = 'Outro' WHERE funcao IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE alunos ALTER COLUMN nome SET NOT NULL;
ALTER TABLE profissionais ALTER COLUMN nome SET NOT NULL;
ALTER TABLE profissionais ALTER COLUMN funcao SET NOT NULL;

-- Add/Update CHECK constraint for funcao
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profissionais_funcao_check'
  ) THEN
    ALTER TABLE profissionais DROP CONSTRAINT profissionais_funcao_check;
  END IF;
  
  ALTER TABLE profissionais 
  ADD CONSTRAINT profissionais_funcao_check 
  CHECK (funcao IN ('Psicólogo(a)', 'Terapeuta da fala', 'Professor(a)', 'Outro'));
END $$;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_alunos_email ON alunos(email);
CREATE INDEX IF NOT EXISTS idx_profissionais_email ON profissionais(email);

-- ========================================
-- Many-to-Many Linking: Join Table
-- ========================================

-- Table: aluno_profissionais (Join table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS aluno_profissionais (
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (aluno_id, profissional_id),
  CONSTRAINT unique_aluno_profissional UNIQUE (aluno_id, profissional_id)
);

-- Indexes for join table
CREATE INDEX IF NOT EXISTS idx_aluno_profissionais_aluno ON aluno_profissionais(aluno_id);
CREATE INDEX IF NOT EXISTS idx_aluno_profissionais_profissional ON aluno_profissionais(profissional_id);

-- Enable Row Level Security on join table
ALTER TABLE aluno_profissionais ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aluno_profissionais table
-- Alunos can insert links where they are the aluno
CREATE POLICY "Alunos can create their own links"
  ON aluno_profissionais FOR INSERT
  WITH CHECK (auth.uid() = aluno_id);

-- Alunos can view their own links
CREATE POLICY "Alunos can view their own links"
  ON aluno_profissionais FOR SELECT
  USING (auth.uid() = aluno_id);

-- Alunos can delete their own links
CREATE POLICY "Alunos can delete their own links"
  ON aluno_profissionais FOR DELETE
  USING (auth.uid() = aluno_id);

-- Profissionais can insert links where they are the profissional
CREATE POLICY "Profissionais can create their own links"
  ON aluno_profissionais FOR INSERT
  WITH CHECK (auth.uid() = profissional_id);

-- Profissionais can view their own links
CREATE POLICY "Profissionais can view their own links"
  ON aluno_profissionais FOR SELECT
  USING (auth.uid() = profissional_id);

-- Profissionais can delete their own links
CREATE POLICY "Profissionais can delete their own links"
  ON aluno_profissionais FOR DELETE
  USING (auth.uid() = profissional_id);

-- ========================================
-- Extended RLS: Linked Users Can Read Each Other
-- ========================================

-- Profissionais can view alunos they are linked to
CREATE POLICY "Profissionais can view linked alunos"
  ON alunos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM aluno_profissionais
      WHERE aluno_profissionais.aluno_id = alunos.id
      AND aluno_profissionais.profissional_id = auth.uid()
    )
  );

-- Alunos can view profissionais they are linked to
CREATE POLICY "Alunos can view linked profissionais"
  ON profissionais FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM aluno_profissionais
      WHERE aluno_profissionais.profissional_id = profissionais.id
      AND aluno_profissionais.aluno_id = auth.uid()
    )
  );

-- ========================================
-- RPC Functions for Secure Email Lookup
-- ========================================

-- Function: lookup_profissional_id_by_email
-- Purpose: Allow authenticated users to find profissional ID by email without exposing full SELECT
-- Returns: UUID of profissional or NULL if not found
CREATE OR REPLACE FUNCTION lookup_profissional_id_by_email(email_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_id uuid;
BEGIN
  -- Verify caller is authenticated and has a valid profile (aluno or profissional)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM alunos WHERE id = auth.uid()
    UNION
    SELECT 1 FROM profissionais WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Invalid user profile';
  END IF;

  -- Lookup profissional by email (case-insensitive)
  SELECT id INTO result_id
  FROM profissionais
  WHERE LOWER(email) = LOWER(email_input);

  RETURN result_id;
END;
$$;

-- Function: lookup_aluno_id_by_email
-- Purpose: Allow authenticated users to find aluno ID by email without exposing full SELECT
-- Returns: UUID of aluno or NULL if not found
CREATE OR REPLACE FUNCTION lookup_aluno_id_by_email(email_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_id uuid;
BEGIN
  -- Verify caller is authenticated and has a valid profile (aluno or profissional)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM alunos WHERE id = auth.uid()
    UNION
    SELECT 1 FROM profissionais WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Invalid user profile';
  END IF;

  -- Lookup aluno by email (case-insensitive)
  SELECT id INTO result_id
  FROM alunos
  WHERE LOWER(email) = LOWER(email_input);

  RETURN result_id;
END;
$$;

-- Grant execute permissions only to authenticated users
GRANT EXECUTE ON FUNCTION lookup_profissional_id_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION lookup_aluno_id_by_email(text) TO authenticated;

-- Revoke from anonymous users
REVOKE EXECUTE ON FUNCTION lookup_profissional_id_by_email(text) FROM anon;
REVOKE EXECUTE ON FUNCTION lookup_aluno_id_by_email(text) FROM anon;


