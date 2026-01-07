import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
const envPath = join(__dirname, '../.env.local');
const envFile = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedExercises() {
  console.log('Inserting exercises into Supabase...');
  
  const exercises = [
    { content: 'O gato está em cima do sofá.', difficulty: 'easy' },
    { content: 'A Maria gosta de ler livros na biblioteca da escola.', difficulty: 'medium' },
    { content: 'As descobertas científicas contemporâneas revolucionaram a nossa compreensão do universo.', difficulty: 'hard' }
  ];

  const { data, error } = await supabase
    .from('exercises')
    .insert(exercises)
    .select();

  if (error) {
    console.error('Error inserting exercises:', error);
    process.exit(1);
  }

  console.log('✓ Successfully inserted', data?.length, 'exercises');
  console.log(data);
}

seedExercises();
