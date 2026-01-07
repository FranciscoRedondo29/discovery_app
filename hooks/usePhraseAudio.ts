import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceSettings {
  modelId: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

interface UsePhraseAudioReturn {
  isPlaying: boolean;
  currentWordIndex: number;
  isLoading: boolean;
  play: (text: string) => Promise<void>;
  pause: () => void;
  reset: () => void;
}

export function usePhraseAudio(
  speed: number = 1.0,
  voiceSettings?: VoiceSettings
): UsePhraseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const lastTextRef = useRef<string>('');
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodeRef.current = null;
    }
    
    // Clear all word timers
    wordTimersRef.current.forEach(timer => clearTimeout(timer));
    wordTimersRef.current = [];
    
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, []);

  const play = useCallback(async (text: string) => {
    if (isPlaying) return;
    
    stopAudio();
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      const voiceId = process.env.NEXT_PUBLIC_VOICE_ID;
      
      if (!apiKey || !voiceId) {
        throw new Error('Configuração de API em falta');
      }

      // Se o texto mudou ou não há cache, buscar novo áudio
      if (text !== lastTextRef.current || !audioBufferRef.current) {
        const modelId = voiceSettings?.modelId || process.env.NEXT_PUBLIC_MODEL_ID || 'eleven_turbo_v2';
        const stability = voiceSettings?.stability ?? parseFloat(process.env.NEXT_PUBLIC_STABILITY || '0.5');
        const similarityBoost = voiceSettings?.similarityBoost ?? parseFloat(process.env.NEXT_PUBLIC_SIMILARITY_BOOST || '0.75');
        const style = voiceSettings?.style ?? parseFloat(process.env.NEXT_PUBLIC_STYLE || '0.0');
        const useSpeakerBoost = voiceSettings?.useSpeakerBoost ?? (process.env.NEXT_PUBLIC_USE_SPEAKER_BOOST === 'true');

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability,
              similarity_boost: similarityBoost,
              style,
              use_speaker_boost: useSpeakerBoost,
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Resume if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        lastTextRef.current = text;
      }

      if (!audioContextRef.current || !audioBufferRef.current) {
        throw new Error('Áudio não inicializado');
      }

      // Create source and play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.playbackRate.value = speed;
      source.connect(audioContextRef.current.destination);
      sourceNodeRef.current = source;

      const duration = audioBufferRef.current.duration / speed;
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const wordDuration = duration / words.length;

      setIsPlaying(true);
      setIsLoading(false);
      setCurrentWordIndex(0);

      // Schedule all word highlights
      wordTimersRef.current = [];
      for (let i = 1; i < words.length; i++) {
        const timer = setTimeout(() => {
          setCurrentWordIndex(i);
        }, i * wordDuration * 1000);
        wordTimersRef.current.push(timer);
      }

      // Final timer to reset highlight
      const finalTimer = setTimeout(() => {
        setCurrentWordIndex(-1);
      }, duration * 1000);
      wordTimersRef.current.push(finalTimer);

      source.onended = () => {
        stopAudio();
      };

      source.start(0);
    } catch (error) {
      console.error('[usePhraseAudio] Error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      throw error;
    }
  }, [isPlaying, speed, voiceSettings, stopAudio]);

  const pause = useCallback(() => {
    stopAudio();
  }, [stopAudio]);

  const reset = useCallback(() => {
    stopAudio();
    audioBufferRef.current = null;
    lastTextRef.current = '';
  }, [stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    currentWordIndex,
    isLoading,
    play,
    pause,
    reset,
  };
}
