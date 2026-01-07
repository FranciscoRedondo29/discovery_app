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

/* 
 * ===================================================================
 * TODO: reativar TTS quando necessário
 * ===================================================================
 * 
 * Código original comentado abaixo para referência futura.
 * Este código integra com ElevenLabs API para gerar TTS.
 * 
 * Para reativar:
 * 1. Descomentar as constantes STORAGE_PREFIX e ELEVENLABS_VOICE_ID
 * 2. Descomentar os refs audioContextRef e sourceNodeRef
 * 3. Descomentar as funções getCachedAudio, setCachedAudio, fetchAudioFromAPI
 * 4. Descomentar a lógica completa da função play
 * 5. Atualizar a função stop para usar sourceNodeRef
 * 6. Descomentar os useEffect de inicialização
 * 
 * 
 * ==================== CÓDIGO COMENTADO ABAIXO ====================
 * 
 * const STORAGE_PREFIX = 'dictation_full_v1_';
 * const ELEVENLABS_VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // George voice
 * 
 * const audioContextRef = useRef<AudioContext | null>(null);
 * const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
 * 
 * useEffect(() => {
 *   const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
 *   if (apiKey) {
 *     console.log('[useDictationAudio] API key found:', apiKey.substring(0, 4) + '...');
 *   } else {
 *     console.error('[useDictationAudio] ⚠️ API key is NOT defined! Check your .env.local file.');
 *   }
 * }, []);
 * 
 * useEffect(() => {
 *   if (typeof window !== 'undefined' && !audioContextRef.current) {
 *     audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
 *     console.log('[useDictationAudio] AudioContext initialized');
 *   }
 * }, []);
 * 
 * const getCachedAudio = useCallback((text: string): string | null => {
 *   if (typeof window === 'undefined') return null;
 *   const key = `${STORAGE_PREFIX}${text.toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`;
 *   return localStorage.getItem(key);
 * }, []);
 * 
 * const setCachedAudio = useCallback((text: string, base64Audio: string): void => {
 *   if (typeof window === 'undefined') return;
 *   const key = `${STORAGE_PREFIX}${text.toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`;
 *   try {
 *     localStorage.setItem(key, base64Audio);
 *     console.log('[useDictationAudio] Audio cached for text:', text.substring(0, 30) + '...');
 *   } catch (error) {
 *     console.warn('[useDictationAudio] Failed to cache audio:', error);
 *     if (error instanceof DOMException && error.name === 'QuotaExceededError') {
 *       const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
 *       if (keys.length > 0) {
 *         console.log('[useDictationAudio] Storage full, clearing oldest entry');
 *         localStorage.removeItem(keys[0]);
 *         try {
 *           localStorage.setItem(key, base64Audio);
 *         } catch {
 *           console.error('[useDictationAudio] Still cannot cache after clearing');
 *         }
 *       }
 *     }
 *   }
 * }, []);
 * 
 * const fetchAudioFromAPI = useCallback(async (text: string): Promise<string> => {
 *   const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
 *   if (!apiKey) {
 *     console.error('[useDictationAudio] ⚠️ API key not found in environment variables');
 *     throw new Error('ElevenLabs API key not configured');
 *   }
 *   const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
 *   console.log('[useDictationAudio] Fetching audio for text:', text.substring(0, 50) + '...');
 *   try {
 *     const response = await fetch(url, {
 *       method: 'POST',
 *       headers: {
 *         'Accept': 'audio/mpeg',
 *         'Content-Type': 'application/json',
 *         'xi-api-key': apiKey,
 *       },
 *       body: JSON.stringify({
 *         text: text,
 *         model_id: 'eleven_turbo_v2_5',
 *         voice_settings: {
 *           stability: 0.5,
 *           similarity_boost: 0.75,
 *           style: 0.0,
 *           use_speaker_boost: true,
 *         },
 *       }),
 *     });
 *     console.log('[useDictationAudio] Response status:', response.status, response.statusText);
 *     if (!response.ok) {
 *       let errorDetails;
 *       try {
 *         errorDetails = await response.json();
 *         console.error('[useDictationAudio] API error details:', errorDetails);
 *       } catch {
 *         errorDetails = await response.text();
 *         console.error('[useDictationAudio] API error (text):', errorDetails);
 *       }
 *       throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`);
 *     }
 *     const audioBlob = await response.blob();
 *     console.log('[useDictationAudio] Audio blob size:', audioBlob.size, 'bytes');
 *     const arrayBuffer = await audioBlob.arrayBuffer();
 *     const base64 = Buffer.from(arrayBuffer).toString('base64');
 *     console.log('[useDictationAudio] ✓ Audio fetched and encoded successfully');
 *     return base64;
 *   } catch (error) {
 *     console.error('[useDictationAudio] Fetch error:', error);
 *     throw error;
 *   }
 * }, []);
 * 
 * const stop = useCallback(() => {
 *   console.log('[useDictationAudio] Stopping playback');
 *   if (sourceNodeRef.current) {
 *     try {
 *       sourceNodeRef.current.stop();
 *       sourceNodeRef.current.disconnect();
 *     } catch (error) {
 *       // Ignore errors if already stopped
 *     }
 *     sourceNodeRef.current = null;
 *   }
 *   setIsPlaying(false);
 *   setIsLoading(false);
 * }, []);
 * 
 * const play = useCallback(async (text: string) => {
 *   if (!text || text.trim().length === 0) {
 *     console.warn('[useDictationAudio] Empty text provided');
 *     return;
 *   }
 *   if (isPlaying) {
 *     console.log('[useDictationAudio] Already playing, stopping previous playback');
 *     stop();
 *   }
 *   console.log('[useDictationAudio] Starting playback for:', text.substring(0, 50) + '...');
 *   setIsLoading(true);
 *   try {
 *     const audioContext = audioContextRef.current;
 *     if (!audioContext) {
 *       throw new Error('AudioContext not initialized');
 *     }
 *     if (audioContext.state === 'closed') {
 *       console.log('[useDictationAudio] AudioContext is closed, recreating...');
 *       audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
 *     }
 *     const activeContext = audioContextRef.current;
 *     if (!activeContext) {
 *       throw new Error('AudioContext not available');
 *     }
 *     console.log('[useDictationAudio] AudioContext state before resume:', activeContext.state);
 *     if (activeContext.state === 'suspended') {
 *       console.log('[useDictationAudio] Resuming suspended AudioContext...');
 *       await activeContext.resume();
 *       console.log('[useDictationAudio] AudioContext state after resume:', activeContext.state);
 *     }
 *     let base64Audio = getCachedAudio(text);
 *     if (!base64Audio) {
 *       console.log('[useDictationAudio] Cache miss, fetching from API');
 *       base64Audio = await fetchAudioFromAPI(text);
 *       setCachedAudio(text, base64Audio);
 *     } else {
 *       console.log('[useDictationAudio] Using cached audio');
 *     }
 *     const binaryString = atob(base64Audio);
 *     const bytes = new Uint8Array(binaryString.length);
 *     for (let i = 0; i < binaryString.length; i++) {
 *       bytes[i] = binaryString.charCodeAt(i);
 *     }
 *     console.log('[useDictationAudio] Decoding audio buffer...');
 *     const audioBuffer = await activeContext.decodeAudioData(bytes.buffer);
 *     console.log('[useDictationAudio] Audio buffer decoded, duration:', audioBuffer.duration, 'seconds');
 *     const source = activeContext.createBufferSource();
 *     source.buffer = audioBuffer;
 *     const gainNode = activeContext.createGain();
 *     gainNode.gain.value = 1.0;
 *     source.connect(gainNode);
 *     gainNode.connect(activeContext.destination);
 *     sourceNodeRef.current = source;
 *     source.onended = () => {
 *       console.log('[useDictationAudio] ✓ Playback completed');
 *       setIsPlaying(false);
 *       sourceNodeRef.current = null;
 *     };
 *     setIsLoading(false);
 *     setIsPlaying(true);
 *     console.log('[useDictationAudio] Starting audio playback...');
 *     source.start(0);
 *   } catch (error) {
 *     console.error('[useDictationAudio] Playback error:', error);
 *     setIsLoading(false);
 *     setIsPlaying(false);
 *     throw error;
 *   }
 * }, [isPlaying, getCachedAudio, fetchAudioFromAPI, setCachedAudio, stop]);
 * 
 */
