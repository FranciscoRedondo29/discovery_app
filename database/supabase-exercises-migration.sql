-- Create exercises table for Learning Mode
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INT4,
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to SELECT exercises
CREATE POLICY "Authenticated users can view exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample sentences in Portuguese (one for each difficulty level)
INSERT INTO exercises (content, difficulty) VALUES
  ('O gato está em cima do sofá.', 'easy'),
  ('A Maria gosta de ler livros na biblioteca da escola.', 'medium'),
  ('As descobertas científicas contemporâneas revolucionaram a nossa compreensão do universo.', 'hard');
