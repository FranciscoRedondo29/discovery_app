-- Supabase Database Schema for Discovery MVP
-- Run this SQL in your Supabase SQL Editor

-- Table: alunos (Students)
CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  escola_instituicao TEXT NOT NULL,
  ano_escolaridade INTEGER NOT NULL CHECK (ano_escolaridade >= 1 AND ano_escolaridade <= 12),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: profissionais (Professionals)
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  escola_instituicao TEXT NOT NULL,
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

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_alunos_email ON alunos(email);
CREATE INDEX IF NOT EXISTS idx_profissionais_email ON profissionais(email);

