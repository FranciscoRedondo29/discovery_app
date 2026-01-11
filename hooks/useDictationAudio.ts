import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDictationAudioReturn {
  play: (text: string) => Promise<void>;
  isPlaying: boolean;
  isLoading: boolean;
  stop: () => void;
}

/**
 * Custom hook for audio playback (local files only)
 * Used for dictation mode where students listen to complete sentences
 * @returns Object with play function and state
 * 
 * NOTE: TTS functionality is currently disabled. Audio is played from local files.
 * TODO: reativar TTS quando necessário - ver código comentado no fim deste ficheiro
 */
export function useDictationAudio(): UseDictationAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Stop current playback
   */
  const stop = useCallback(() => {
    console.log('[useDictationAudio] Stopping playback');
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  /**
   * Play audio for the given text (stub - actual playback handled in component)
   */
  const play = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn('[useDictationAudio] Empty text provided');
      return;
    }

    console.log('[useDictationAudio] Play called for:', text.substring(0, 50) + '...');
    
    // Note: Actual audio playback is now handled directly in the component
    // using HTMLAudioElement with local audio files
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    play,
    isPlaying,
    isLoading,
    stop,
  };
}
