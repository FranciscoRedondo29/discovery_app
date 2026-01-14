import { useState, useCallback, useRef, useEffect } from 'react';
import type { WordTiming } from '@/types/exercises';

interface UseWordAudioReturn {
  isPlayingWord: boolean;
  currentPlayingWord: string | null;
  playWord: (word: string, wordTiming: WordTiming, sentenceBuffer: AudioBuffer) => Promise<void>;
  stopWord: () => void;
}

/**
 * Custom hook for word-level audio playback
 * 
 * Extracts individual word audio from a sentence AudioBuffer using WordTiming data.
 * This approach provides:
 * - Zero latency (no network requests)
 * - Professional audio quality (uses sentence recording)
 * - No additional audio assets required
 * 
 * Technical approach:
 * 1. Takes the full sentence AudioBuffer (already loaded)
 * 2. Extracts the audio segment for a specific word using its start/end times
 * 3. Creates a new AudioBuffer containing only that word's audio
 * 4. Plays the extracted segment
 * 
 * @example
 * const wordAudio = useWordAudio();
 * 
 * // When user clicks a word:
 * await wordAudio.playWord("aluno", { word: "aluno", start: 0.5, end: 1.2 }, sentenceBuffer);
 */
export function useWordAudio(): UseWordAudioReturn {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [currentPlayingWord, setCurrentPlayingWord] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize AudioContext on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Cleanup on unmount
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
   * Stop any currently playing word audio
   */
  const stopWord = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped - this is fine
      }
      sourceNodeRef.current = null;
    }
    setIsPlayingWord(false);
    setCurrentPlayingWord(null);
  }, []);

  /**
   * Extract and play audio for a specific word from the sentence buffer
   * 
   * @param word - The word text (for tracking which word is playing)
   * @param wordTiming - Timing data with start/end times in seconds
   * @param sentenceBuffer - The full sentence AudioBuffer
   */
  const playWord = useCallback(async (
    word: string,
    wordTiming: WordTiming,
    sentenceBuffer: AudioBuffer
  ) => {
    // Stop any existing word playback
    stopWord();

    // Initialize or resume AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume if suspended (required on iOS/Safari)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const audioContext = audioContextRef.current;
    const sampleRate = sentenceBuffer.sampleRate;

    // Calculate sample indices from time values
    // wordTiming.start and wordTiming.end are in seconds
    const startSample = Math.floor(wordTiming.start * sampleRate);
    const endSample = Math.floor(wordTiming.end * sampleRate);
    const duration = endSample - startSample;

    // Validate duration
    if (duration <= 0) {
      console.warn(`[useWordAudio] Invalid duration for word "${word}":`, { start: wordTiming.start, end: wordTiming.end });
      return;
    }

    // Create a new AudioBuffer for just this word's audio
    const wordBuffer = audioContext.createBuffer(
      sentenceBuffer.numberOfChannels,
      duration,
      sampleRate
    );

    // Copy the audio data for the word segment from the sentence buffer
    for (let channel = 0; channel < sentenceBuffer.numberOfChannels; channel++) {
      const sourceData = sentenceBuffer.getChannelData(channel);
      const targetData = wordBuffer.getChannelData(channel);
      
      for (let i = 0; i < duration; i++) {
        const sourceIndex = startSample + i;
        // Bounds check to prevent reading beyond buffer
        if (sourceIndex < sourceData.length) {
          targetData[i] = sourceData[sourceIndex];
        }
      }
    }

    // Create source node and connect to output
    const source = audioContext.createBufferSource();
    source.buffer = wordBuffer;
    source.connect(audioContext.destination);
    sourceNodeRef.current = source;

    // Update state before playing
    setIsPlayingWord(true);
    setCurrentPlayingWord(word);

    // Handle playback end
    source.onended = () => {
      stopWord();
    };

    // Start playback
    source.start(0);
  }, [stopWord]);

  return {
    isPlayingWord,
    currentPlayingWord,
    playWord,
    stopWord,
  };
}
