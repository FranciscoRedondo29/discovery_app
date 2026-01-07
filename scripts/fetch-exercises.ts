import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
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

async function fetchAndUpdatePhrases() {
  console.log('Fetching exercises from Supabase...');
  
  // Try without authentication first
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('difficulty', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching exercises:', error);
    console.log('Trying to fetch count...');
    
    const { count, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log('Table has', count, 'rows');
    }
    process.exit(1);
  }

  console.log('Raw data from Supabase:', data);

  if (!data || data.length === 0) {
    console.error('No exercises found in Supabase!');
    console.log('The exercises table exists but is empty or inaccessible.');
    console.log('Please add exercises to the Supabase table manually or check RLS policies.');
    process.exit(1);
  }

  console.log(`Found ${data.length} exercises in Supabase`);

  // Map exercises to phrases
  const phrases = data.map((exercise, index) => ({
    id: index + 1,
    level: exercise.difficulty as 'easy' | 'medium' | 'hard',
    text: exercise.content
  }));

  // Count by level
  const easyCount = phrases.filter(p => p.level === 'easy').length;
  const mediumCount = phrases.filter(p => p.level === 'medium').length;
  const hardCount = phrases.filter(p => p.level === 'hard').length;

  console.log(`Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount}`);

  // Generate the phrases.ts file content
  const fileContent = `import type { Phrase } from '@/types/exercises';

export const PHRASES: Phrase[] = [
${phrases.map(p => `  { id: ${p.id}, level: '${p.level}', text: '${p.text.replace(/'/g, "\\'")}' },`).join('\n')}
];

export function getPhrasesByLevel(level: 'easy' | 'medium' | 'hard'): Phrase[] {
  return PHRASES.filter(phrase => phrase.level === level);
}

export function getRandomPhrase(level: 'easy' | 'medium' | 'hard'): Phrase {
  const phrases = getPhrasesByLevel(level);
  return phrases[Math.floor(Math.random() * phrases.length)];
}
`;

  // Write to phrases.ts
  const phrasesPath = join(__dirname, '../lib/phrases.ts');
  writeFileSync(phrasesPath, fileContent, 'utf-8');

  console.log('✓ Successfully updated lib/phrases.ts');
  console.log(`✓ Total phrases: ${phrases.length}`);
}

fetchAndUpdatePhrases();
