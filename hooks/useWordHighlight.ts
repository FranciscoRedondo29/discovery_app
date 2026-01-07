import { useState, useCallback, useRef, useEffect } from 'react';
import type { WordTiming } from '@/types/exercises';

interface WordHighlightReturn {
  isPlaying: boolean;
  currentWordIndex: number;
  words: string[];
  play: (wordTimings: WordTiming[]) => void;
  pause: () => void;
  reset: () => void;
  startTime: number | null;
}

/**
 * Hook for highlighting words synchronized with audio playback using wordTimings
 * Uses the start/end times from the audio file to highlight words in sync
 */
export function useWordHighlight(): WordHighlightReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const animationFrameRef = useRef<number | null>(null);
  const wordTimingsRef = useRef<WordTiming[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    cancelAnimation();
    setIsPlaying(false);
  }, [cancelAnimation]);

  const reset = useCallback(() => {
    pause();
    setCurrentWordIndex(-1);
    setWords([]);
    setStartTime(null);
    startTimeRef.current = null;
    wordTimingsRef.current = [];
  }, [pause]);

  const play = useCallback((wordTimings: WordTiming[]) => {
    reset();
    
    if (!wordTimings || wordTimings.length === 0) return;
    
    wordTimingsRef.current = wordTimings;
    
    // Extract words for display
    const wordList = wordTimings.map(t => t.word);
    setWords(wordList);
    
    setIsPlaying(true);
    const now = performance.now();
    startTimeRef.current = now;
    setStartTime(now);
    
    // Animation loop that checks current time against word timings
    const updateHighlight = () => {
      if (!startTimeRef.current) return;
      
      const elapsed = (performance.now() - startTimeRef.current) / 1000; // Convert to seconds
      const timings = wordTimingsRef.current;
      
      // Find which word should be highlighted based on elapsed time
      let foundIndex = -1;
      for (let i = 0; i < timings.length; i++) {
        if (elapsed >= timings[i].start && elapsed < timings[i].end) {
          foundIndex = i;
          break;
        }
      }
      
      // Check if we've passed the last word
      const lastTiming = timings[timings.length - 1];
      if (elapsed >= lastTiming.end) {
        setCurrentWordIndex(-1);
        setIsPlaying(false);
        startTimeRef.current = null;
        return;
      }
      
      setCurrentWordIndex(foundIndex);
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(updateHighlight);
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateHighlight);
  }, [reset]);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    isPlaying,
    currentWordIndex,
    words,
    play,
    pause,
    reset,
    startTime,
  };
}
