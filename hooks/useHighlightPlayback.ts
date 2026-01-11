import { useState, useCallback, useRef, useEffect } from 'react';

interface HighlightPlaybackReturn {
  isPlaying: boolean;
  currentTokenIndex: number;
  currentSyllableIndex: number; // Index of current syllable (excluding spaces/hyphens)
  play: (syllablesString: string, playbackSpeed?: number) => void;
  pause: () => void;
  reset: () => void;
  tokens: string[];
}

const SYLLABLE_DURATION_MS = 500; // 0.5s per syllable
const SPACE_DURATION_MS = 240; // 0.24s pause for spaces (no highlight)
const HYPHEN_DURATION_MS = 240; // 0.24s pause between syllables of same word (no highlight)

/**
 * Parse syllables string into tokens preserving spaces and hyphens
 * Ex: "O Pe-dro pin-ta" → ["O", " ", "Pe", "-", "dro", " ", "pin", "-", "ta"]
 */
function parseSyllables(syllablesStr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  
  while (i < syllablesStr.length) {
    const char = syllablesStr[i];
    
    if (char === ' ') {
      tokens.push(' ');
      i++;
    } else if (char === '-') {
      tokens.push('-');
      i++;
    } else {
      // Accumulate non-space, non-hyphen characters (syllable)
      let syllable = '';
      while (i < syllablesStr.length && syllablesStr[i] !== ' ' && syllablesStr[i] !== '-') {
        syllable += syllablesStr[i];
        i++;
      }
      if (syllable) {
        tokens.push(syllable);
      }
    }
  }
  
  return tokens;
}

export function useHighlightPlayback(): HighlightPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(-1);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(-1);
  const [tokens, setTokens] = useState<string[]>([]);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  const syllableIndexRef = useRef(0);

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
    setCurrentTokenIndex(-1);
    setCurrentSyllableIndex(-1);
    setTokens([]);
    indexRef.current = 0;
    syllableIndexRef.current = 0;
  }, [pause]);

  const play = useCallback((syllablesString: string, playbackSpeed: number = 1.0) => {
    reset();
    
    const parsedTokens = parseSyllables(syllablesString);
    setTokens(parsedTokens);
    
    if (parsedTokens.length === 0) return;
    
    setIsPlaying(true);
    indexRef.current = 0;
    syllableIndexRef.current = 0;
    
    const playNext = () => {
      if (indexRef.current >= parsedTokens.length) {
        setIsPlaying(false);
        setCurrentTokenIndex(-1);
        setCurrentSyllableIndex(-1);
        return;
      }
      
      const token = parsedTokens[indexRef.current];
      
      // For spaces and hyphens: pause without highlighting
      if (token === ' ' || token === '-') {
        setCurrentTokenIndex(-1);
        setCurrentSyllableIndex(-1); // No highlight during pause
        const duration = token === ' ' ? SPACE_DURATION_MS : HYPHEN_DURATION_MS;
        indexRef.current++;
        timeoutRef.current = setTimeout(playNext, duration / playbackSpeed);
        return;
      }
      
      // Syllable: highlight it
      setCurrentTokenIndex(indexRef.current);
      setCurrentSyllableIndex(syllableIndexRef.current);
      
      indexRef.current++;
      syllableIndexRef.current++;
      timeoutRef.current = setTimeout(playNext, SYLLABLE_DURATION_MS / playbackSpeed);
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
    currentTokenIndex,
    currentSyllableIndex,
    play,
    pause,
    reset,
    tokens,
  };
}
