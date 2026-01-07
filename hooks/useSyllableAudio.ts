import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSyllableAudioReturn {
  isPlaying: boolean;
  currentSyllableIndex: number;
  isLoading: boolean;
  play: () => Promise<void>;
  pause: () => void;
  reset: () => void;
}

const STORAGE_PREFIX = 'syllib_v2_'; // v2 for eleven_turbo_v2_5 model

/**
 * Custom hook for syllable-by-syllable audio playback with caching
 * @param syllables - Array of syllables to play
 * @param speed - Playback speed multiplier (1.0 = normal, 2.0 = 2x speed)
 */
export function useSyllableAudio(
  syllables: string[],
  speed: number = 1.0
): UseSyllableAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: Check API key on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) {
      console.log('[useSyllableAudio] API key found:', apiKey.substring(0, 4) + '...');
    } else {
      console.error('[useSyllableAudio] ⚠️ API key is NOT defined! Check your .env.local file.');
    }
  }, []);

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('[useSyllableAudio] AudioContext initialized');
    }

    // Don't close AudioContext in cleanup - let it stay open
    // Closing and reopening AudioContext can cause issues
  }, []);

  /**
   * Get cached audio from localStorage
   */
  const getCachedAudio = useCallback((syllable: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const key = `${STORAGE_PREFIX}${syllable.toLowerCase()}`;
    return localStorage.getItem(key);
  }, []);

  /**
   * Cache audio in localStorage
   */
  const setCachedAudio = useCallback((syllable: string, base64Audio: string): void => {
    if (typeof window === 'undefined') return;
    
    const key = `${STORAGE_PREFIX}${syllable.toLowerCase()}`;
    try {
      localStorage.setItem(key, base64Audio);
    } catch (error) {
      console.warn('[useSyllableAudio] Failed to cache audio:', error);
      // If storage is full, clear old entries
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Clear oldest entries
        const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
        if (keys.length > 0) {
          localStorage.removeItem(keys[0]);
          // Try again
          try {
            localStorage.setItem(key, base64Audio);
          } catch {
            console.error('[useSyllableAudio] Still cannot cache after clearing');
          }
        }
      }
    }
  }, []);

  /**
  /**
   * Fetch audio from ElevenLabs API
   */
  const fetchAudioFromAPI = useCallback(async (syllable: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const voiceId = process.env.NEXT_PUBLIC_VOICE_ID;
    
    if (!apiKey) {
      console.error('[useSyllableAudio] ⚠️ API key not found in environment variables');
      throw new Error('ElevenLabs API key not configured');
    }

    if (!voiceId) {
      console.error('[useSyllableAudio] ⚠️ Voice ID not found in environment variables');
      throw new Error('Voice ID not configured');
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    console.log('[useSyllableAudio] Fetching audio for syllable:', syllable);
    console.log('[useSyllableAudio] API URL:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: syllable,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      console.log('[useSyllableAudio] Response status:', response.status, response.statusText);

      if (!response.ok) {
        // Try to get error details from response
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.error('[useSyllableAudio] API error details:', errorDetails);
        } catch {
          errorDetails = await response.text();
          console.error('[useSyllableAudio] API error (text):', errorDetails);
        }
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`);
      }

      const audioBlob = await response.blob();
      console.log('[useSyllableAudio] Audio blob size:', audioBlob.size, 'bytes');
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Convert ArrayBuffer to base64 without Buffer.from (browser-safe)
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      
      console.log('[useSyllableAudio] ✓ Audio fetched and encoded successfully');
      return base64;
    } catch (error) {
      console.error('[useSyllableAudio] Fetch error:', error);
      throw error;
    }
  }, []);

  /**
   * Get audio for a syllable (from cache or API)
   */
  const getAudio = useCallback(async (syllable: string): Promise<string> => {
    // Check cache first
    const cached = getCachedAudio(syllable);
    if (cached) {
      console.log('[useSyllableAudio] Using cached audio for:', syllable);
      return cached;
    }

    console.log('[useSyllableAudio] Cache miss, fetching from API for:', syllable);
    // Fetch from API
    const base64Audio = await fetchAudioFromAPI(syllable);
    
    // Cache for future use
    setCachedAudio(syllable, base64Audio);
    
    return base64Audio;
  }, [getCachedAudio, fetchAudioFromAPI, setCachedAudio]);

  /**
   * Play a single syllable
   */
  const playSyllable = useCallback(async (
    syllable: string,
    index: number,
    audioContext: AudioContext
  ): Promise<void> => {
    // Update index immediately so UI can highlight
    setCurrentSyllableIndex(index);

    try {
      console.log('[useSyllableAudio] Playing syllable:', syllable, 'at index:', index);
      const base64Audio = await getAudio(syllable);
      
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('[useSyllableAudio] Decoding audio buffer...');
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      console.log('[useSyllableAudio] Audio buffer decoded, duration:', audioBuffer.duration, 'seconds');
      console.log('[useSyllableAudio] AudioContext state before playing:', audioContext.state);
      console.log('[useSyllableAudio] AudioContext destination:', audioContext.destination);
      
      // Create audio source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Apply speed adjustment
      source.playbackRate.value = speed;
      
      // Connect to output
      source.connect(audioContext.destination);
      console.log('[useSyllableAudio] Source connected to destination');
      
      // Play and wait for completion
      return new Promise((resolve) => {
        source.onended = () => {
          console.log('[useSyllableAudio] Syllable playback ended:', syllable);
          resolve();
        };
        console.log('[usySyllableAudio] About to call source.start(0)...');
        source.start(0);
        console.log('[useSyllableAudio] source.start(0) called, syllable playback started:', syllable);
      });
    } catch (error) {
      console.error(`[useSyllableAudio] Error playing syllable "${syllable}":`, error);
      throw error;
    }
  }, [getAudio, speed]);

  /**
   * Play all syllables in sequence
   */
  const play = useCallback(async () => {
    if (isPlaying || syllables.length === 0) {
      console.log('[useSyllableAudio] Cannot play: isPlaying=', isPlaying, 'syllables.length=', syllables.length);
      return;
    }
    
    console.log('[useSyllableAudio] Starting playback of', syllables.length, 'syllables');
    
    // Abort any previous playback
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsPlaying(true);
    setIsLoading(true);
    setCurrentSyllableIndex(-1);

    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) {
        throw new Error('AudioContext not initialized');
      }

      // If AudioContext is closed, recreate it
      if (audioContext.state === 'closed') {
        console.log('[useSyllableAudio] AudioContext is closed, recreating...');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[useSyllableAudio] New AudioContext created');
      }

      const activeContext = audioContextRef.current;

      // Resume AudioContext if suspended (browser autoplay policy)
      if (activeContext && activeContext.state === 'suspended') {
        console.log('[useSyllableAudio] Resuming suspended AudioContext...');
        await activeContext.resume();
        console.log('[useSyllableAudio] AudioContext state after resume:', activeContext.state);
      } else if (activeContext) {
        console.log('[useSyllableAudio] AudioContext state:', activeContext.state);
      }

      // Guard against null activeContext
      if (!activeContext) {
        throw new Error('AudioContext is not available');
      }

      setIsLoading(false);

      // Play each syllable
      for (let i = 0; i < syllables.length; i++) {
        if (signal.aborted) {
          console.log('[useSyllableAudio] Playback aborted at index', i);
          break;
        }

        await playSyllable(syllables[i], i, activeContext);
        
        // Pause between syllables: 0.5 seconds (adjusted by speed)
        if (i < syllables.length - 1 && !signal.aborted) {
          await new Promise(resolve => {
            playbackTimeoutRef.current = setTimeout(resolve, 500 / speed);
          });
        }
      }

      // Playback complete
      if (!signal.aborted) {
        console.log('[useSyllableAudio] ✓ Playback completed successfully');
        setCurrentSyllableIndex(-1);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('[useSyllableAudio] Playback error:', error);
      }
      setIsLoading(false);
    } finally {
      setIsPlaying(false);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [syllables, isPlaying, playSyllable, speed]);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    console.log('[useSyllableAudio] Pausing playback');
    console.trace('[useSyllableAudio] Pause called from:'); // Add stack trace
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }

    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  /**
   * Reset to beginning
   */
  const reset = useCallback(() => {
    console.log('[useSyllableAudio] Resetting playback');
    pause();
    setCurrentSyllableIndex(-1);
  }, [pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pause();
    };
  }, [pause]);

  return {
    isPlaying,
    currentSyllableIndex,
    isLoading,
    play,
    pause,
    reset,
  };
}
