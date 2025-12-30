import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSyllableAudioReturn {
  isPlaying: boolean;
  currentSyllableIndex: number;
  isLoading: boolean;
  play: () => Promise<void>;
  pause: () => void;
  reset: () => void;
}

const STORAGE_PREFIX = 'syllib_';
const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice - adjust as needed

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

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
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
      console.warn('Failed to cache audio:', error);
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
            console.error('Still cannot cache after clearing');
          }
        }
      }
    }
  }, []);

  /**
   * Fetch audio from ElevenLabs API
   */
  const fetchAudioFromAPI = useCallback(async (syllable: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: syllable,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return base64;
  }, []);

  /**
   * Get audio for a syllable (from cache or API)
   */
  const getAudio = useCallback(async (syllable: string): Promise<string> => {
    // Check cache first
    const cached = getCachedAudio(syllable);
    if (cached) {
      return cached;
    }

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
      const base64Audio = await getAudio(syllable);
      
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      
      // Create audio source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Apply speed adjustment
      source.playbackRate.value = speed;
      
      // Connect to output
      source.connect(audioContext.destination);
      
      // Play and wait for completion
      return new Promise((resolve) => {
        source.onended = () => {
          resolve();
        };
        source.start(0);
      });
    } catch (error) {
      console.error(`Error playing syllable "${syllable}":`, error);
      throw error;
    }
  }, [getAudio, speed]);

  /**
   * Play all syllables in sequence
   */
  const play = useCallback(async () => {
    if (isPlaying || syllables.length === 0) return;
    
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

      // Resume AudioContext if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      setIsLoading(false);

      // Play each syllable
      for (let i = 0; i < syllables.length; i++) {
        if (signal.aborted) {
          break;
        }

        await playSyllable(syllables[i], i, audioContext);
        
        // Small pause between syllables (adjusted by speed)
        if (i < syllables.length - 1 && !signal.aborted) {
          await new Promise(resolve => {
            playbackTimeoutRef.current = setTimeout(resolve, 100 / speed);
          });
        }
      }

      // Playback complete
      if (!signal.aborted) {
        setCurrentSyllableIndex(-1);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Playback error:', error);
      }
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
