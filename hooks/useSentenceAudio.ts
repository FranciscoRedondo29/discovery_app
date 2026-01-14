import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSentenceAudioReturn {
  audioBuffer: AudioBuffer | null;
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  loadAudio: (audioUrl: string) => Promise<void>;
  play: (playbackSpeed?: number) => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Custom hook for loading and playing sentence audio with AudioBuffer access
 * 
 * This hook provides:
 * 1. Audio loading with AudioBuffer exposure (for word extraction)
 * 2. Playback controls (play/pause with speed control)
 * 3. Loading and error states
 * 
 * The AudioBuffer is exposed so that useWordAudio can extract word segments
 * without additional network requests.
 * 
 * @example
 * const sentenceAudio = useSentenceAudio();
 * 
 * // Load audio file
 * await sentenceAudio.loadAudio('/audios/sentence.m4a');
 * 
 * // Play at normal speed
 * sentenceAudio.play();
 * 
 * // Access buffer for word extraction
 * const buffer = sentenceAudio.audioBuffer;
 */
export function useSentenceAudio(): UseSentenceAudioReturn {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {
          // Already stopped
        }
      }
    };
  }, []);

  /**
   * Stop current playback
   */
  const pause = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    pause();
    setAudioBuffer(null);
    setError(null);
    currentUrlRef.current = null;
  }, [pause]);

  /**
   * Load audio file and decode to AudioBuffer
   * Uses caching - won't reload if same URL
   */
  const loadAudio = useCallback(async (audioUrl: string) => {
    // If already loaded this URL, no need to reload
    if (currentUrlRef.current === audioUrl && audioBuffer) {
      return;
    }

    setIsLoading(true);
    setError(null);
    pause();

    try {
      // Initialize AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Fetch audio file
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      setAudioBuffer(decodedBuffer);
      currentUrlRef.current = audioUrl;
      setError(null);
    } catch (err) {
      console.error('[useSentenceAudio] Error loading audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audio');
      setAudioBuffer(null);
      currentUrlRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [audioBuffer, pause]);

  /**
   * Play the loaded audio buffer
   */
  const play = useCallback((playbackSpeed: number = 1.0) => {
    if (!audioBuffer || !audioContextRef.current) {
      console.warn('[useSentenceAudio] Cannot play: audio not loaded');
      return;
    }

    // Stop any existing playback
    pause();

    try {
      // Create source node
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackSpeed;
      source.connect(audioContextRef.current.destination);
      sourceNodeRef.current = source;

      // Set up end handler
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      // Start playback
      source.start(0);
      setIsPlaying(true);
    } catch (err) {
      console.error('[useSentenceAudio] Error playing audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      setIsPlaying(false);
    }
  }, [audioBuffer, pause]);

  return {
    audioBuffer,
    isLoading,
    isPlaying,
    error,
    loadAudio,
    play,
    pause,
    reset,
  };
}
