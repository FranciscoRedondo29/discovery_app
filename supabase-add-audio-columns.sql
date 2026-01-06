-- Adicionar colunas de áudio à tabela exercises
-- Execute este SQL no Supabase SQL Editor

-- Adicionar duas colunas para armazenar URLs dos arquivos de áudio MP4
ALTER TABLE exercises 
ADD COLUMN audio_url_1 TEXT,
ADD COLUMN audio_url_2 TEXT;

-- Opcional: Adicionar comentários descritivos às colunas
COMMENT ON COLUMN exercises.audio_url_1 IS 'URL do primeiro arquivo de áudio MP4 no Supabase Storage';
COMMENT ON COLUMN exercises.audio_url_2 IS 'URL do segundo arquivo de áudio MP4 no Supabase Storage';

-- Criar bucket de storage para os áudios (se ainda não existir)
-- Este comando deve ser executado no Supabase Storage ou via código
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('exercise-audios', 'exercise-audios', true);
