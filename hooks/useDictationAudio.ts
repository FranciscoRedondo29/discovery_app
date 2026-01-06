import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDictationAudioReturn {
  play: (text: string) => Promise<void>;
  isPlaying: boolean;
  isLoading: boolean;
  stop: () => void;
}

const STORAGE_PREFIX = 'dictation_full_v1_';
const ELEVENLABS_VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // George voice - good for dictation
// Alternative: 'Xb7hH8MSUJpSbSDYk0k2' for Alice voice

/**
 * Custom hook for full-sentence audio playback with caching
 * Used for dictation mode where students listen to complete sentences
 * @returns Object with play function and state
 */
export function useDictationAudio(): UseDictationAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Debug: Check API key on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (apiKey) {
      console.log('[useDictationAudio] API key found:', apiKey.substring(0, 4) + '...');
    } else {
      console.error('[useDictationAudio] ⚠️ API key is NOT defined! Check your .env.local file.');
    }
  }, []);

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('[useDictationAudio] AudioContext initialized');
    }
  }, []);

  /**
   * Get cached audio from localStorage
   */
  const getCachedAudio = useCallback((text: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Create a simple hash of the text for the cache key
    const key = `${STORAGE_PREFIX}${text.toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`;
    return localStorage.getItem(key);
  }, []);

  /**
   * Cache audio in localStorage
   */
  const setCachedAudio = useCallback((text: string, base64Audio: string): void => {
    if (typeof window === 'undefined') return;
    
    const key = `${STORAGE_PREFIX}${text.toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`;
    try {
      localStorage.setItem(key, base64Audio);
      console.log('[useDictationAudio] Audio cached for text:', text.substring(0, 30) + '...');
    } catch (error) {
      console.warn('[useDictationAudio] Failed to cache audio:', error);
      
      // If storage is full, clear old dictation entries
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
        if (keys.length > 0) {
          console.log('[useDictationAudio] Storage full, clearing oldest entry');
          localStorage.removeItem(keys[0]);
          try {
            localStorage.setItem(key, base64Audio);
          } catch {
            console.error('[useDictationAudio] Still cannot cache after clearing');
          }
        }
      }
    }
  }, []);

  /**
   * Fetch audio from ElevenLabs API
   */
  const fetchAudioFromAPI = useCallback(async (text: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('[useDictationAudio] ⚠️ API key not found in environment variables');
      throw new Error('ElevenLabs API key not configured');
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
    
    console.log('[useDictationAudio] Fetching audio for text:', text.substring(0, 50) + '...');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      console.log('[useDictationAudio] Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.error('[useDictationAudio] API error details:', errorDetails);
        } catch {
          errorDetails = await response.text();
          console.error('[useDictationAudio] API error (text):', errorDetails);
        }
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`);
      }

      const audioBlob = await response.blob();
      console.log('[useDictationAudio] Audio blob size:', audioBlob.size, 'bytes');
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      console.log('[useDictationAudio] ✓ Audio fetched and encoded successfully');
      return base64;
    } catch (error) {
      console.error('[useDictationAudio] Fetch error:', error);
      throw error;
    }
  }, []);

  /**
   * Stop current playback
   */
  const stop = useCallback(() => {
    console.log('[useDictationAudio] Stopping playback');
    
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (error) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  /**
   * Play audio for the given text
   */
  const play = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn('[useDictationAudio] Empty text provided');
      return;
    }

    if (isPlaying) {
      console.log('[useDictationAudio] Already playing, stopping previous playback');
      stop();
    }

    console.log('[useDictationAudio] Starting playback for:', text.substring(0, 50) + '...');
    
    setIsLoading(true);

    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) {
        throw new Error('AudioContext not initialized');
      }

      // If AudioContext is closed, recreate it
      if (audioContext.state === 'closed') {
        console.log('[useDictationAudio] AudioContext is closed, recreating...');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const activeContext = audioContextRef.current;
      if (!activeContext) {
        throw new Error('AudioContext not available');
      }

      console.log('[useDictationAudio] AudioContext state before resume:', activeContext.state);

      // Resume AudioContext if suspended (browser autoplay policy)
      if (activeContext.state === 'suspended') {
        console.log('[useDictationAudio] Resuming suspended AudioContext...');
        await activeContext.resume();
        console.log('[useDictationAudio] AudioContext state after resume:', activeContext.state);
      }

      // Check cache first
      let base64Audio = getCachedAudio(text);
      
      if (!base64Audio) {
        console.log('[useDictationAudio] Cache miss, fetching from API');
        base64Audio = await fetchAudioFromAPI(text);
        setCachedAudio(text, base64Audio);
      } else {
        console.log('[useDictationAudio] Using cached audio');
      }

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('[useDictationAudio] Decoding audio buffer...');
      const audioBuffer = await activeContext.decodeAudioData(bytes.buffer);
      console.log('[useDictationAudio] Audio buffer decoded, duration:', audioBuffer.duration, 'seconds');
      console.log('[useDictationAudio] AudioContext state before playback:', activeContext.state);
      console.log('[useDictationAudio] AudioContext sampleRate:', activeContext.sampleRate);
      
      // Create audio source
      const source = activeContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Create a gain node to control volume
      const gainNode = activeContext.createGain();
      gainNode.gain.value = 1.0; // Full volume
      
      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(activeContext.destination);
      
      console.log('[useDictationAudio] Source created and connected to destination with gain node');
      console.log('[useDictationAudio] Gain value:', gainNode.gain.value);
      console.log('[useDictationAudio] Destination maxChannelCount:', activeContext.destination.maxChannelCount);
      
      sourceNodeRef.current = source;

      // Set up completion handler
      source.onended = () => {
        console.log('[useDictationAudio] ✓ Playback completed');
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      setIsLoading(false);
      setIsPlaying(true);

      console.log('[useDictationAudio] Starting audio playback...');
      const startTime = activeContext.currentTime;
      source.start(0);
      console.log('[useDictationAudio] Audio playback started at context time:', startTime);
      console.log('[useDictationAudio] Expected end time:', startTime + audioBuffer.duration);

    } catch (error) {
      console.error('[useDictationAudio] Playback error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      throw error;
    }
  }, [isPlaying, getCachedAudio, fetchAudioFromAPI, setCachedAudio, stop]);

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
