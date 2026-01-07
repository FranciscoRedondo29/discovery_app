import { useState, useCallback, useRef, useEffect } from 'react';

interface WordHighlightReturn {
  isPlaying: boolean;
  currentWordIndex: number;
  words: string[];
  play: (text: string, syllablesStr: string) => void;
  pause: () => void;
  reset: () => void;
}

const SYLLABLE_DURATION_MS = 300; // 0.3s per syllable
const SPACE_DURATION_MS = 300; // 0.3s pause between words

/**
 * Count syllables in a word based on the syllables string
 * Ex: text="Pedro", syllables="Pe-dro" → 2 syllables
 */
function countSyllablesInWord(word: string, syllablesStr: string): number {
  // Remove punctuation from word for matching
  const cleanWord = word.replace(/[.,!?;:]/g, '');
  
  // Find the word in the syllables string (case-insensitive)
  const syllableWords = syllablesStr.split(/\s+/);
  
  for (const syllableWord of syllableWords) {
    // Clean syllable word of punctuation for comparison
    const cleanSyllableWord = syllableWord.replace(/[.,!?;:]/g, '');
    // Compare base word (without hyphens)
    const baseWord = cleanSyllableWord.replace(/-/g, '');
    
    if (baseWord.toLowerCase() === cleanWord.toLowerCase()) {
      // Count hyphens + 1 = number of syllables
      const hyphenCount = (syllableWord.match(/-/g) || []).length;
      return hyphenCount + 1;
    }
  }
  
  // Default: assume 1 syllable if not found
  return 1;
}

/**
 * Build word timing array
 * Returns array of { word, duration, isSpace }
 */
function buildWordTimings(text: string, syllablesStr: string): { word: string; duration: number; isSpace: boolean }[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const timings: { word: string; duration: number; isSpace: boolean }[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const syllableCount = countSyllablesInWord(word, syllablesStr);
    const duration = syllableCount * SYLLABLE_DURATION_MS;
    
    timings.push({ word, duration, isSpace: false });
    
    // Add space pause between words (except after last word)
    if (i < words.length - 1) {
      timings.push({ word: ' ', duration: SPACE_DURATION_MS, isSpace: true });
    }
  }
  
  return timings;
}

export function useWordHighlight(): WordHighlightReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  const timingsRef = useRef<{ word: string; duration: number; isSpace: boolean }[]>([]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    pause();
    setCurrentWordIndex(-1);
    setWords([]);
    indexRef.current = 0;
    timingsRef.current = [];
  }, [pause]);

  const play = useCallback((text: string, syllablesStr: string) => {
    reset();
    
    const timings = buildWordTimings(text, syllablesStr);
    timingsRef.current = timings;
    
    // Extract just the words (not spaces) for display
    const wordList = timings.filter(t => !t.isSpace).map(t => t.word);
    setWords(wordList);
    
    if (timings.length === 0) return;
    
    setIsPlaying(true);
    indexRef.current = 0;
    
    let wordIdx = 0; // Track which word we're on (excluding spaces)
    
    const playNext = () => {
      if (indexRef.current >= timings.length) {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
        return;
      }
      
      const timing = timings[indexRef.current];
      
      if (timing.isSpace) {
        // Space: don't highlight anything, just wait
        setCurrentWordIndex(-1);
      } else {
        // Word: highlight it
        setCurrentWordIndex(wordIdx);
        wordIdx++;
      }
      
      indexRef.current++;
      timeoutRef.current = setTimeout(playNext, timing.duration);
    };
    
    playNext();
  }, [reset]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isPlaying,
    currentWordIndex,
    words,
    play,
    pause,
    reset,
  };
}
