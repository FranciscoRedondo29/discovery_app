"use client";

import { useRef, useState, useEffect } from "react";

/**
 * Word timing structure: each word has a start and end time in seconds
 */
type WordTiming = {
  word: string;
  start: number;
  end: number;
};

/**
 * Phrase structure containing all necessary data for playback
 */
type Phrase = {
  id: number;
  text: string;
  audioFile: string;
  wordTimings: WordTiming[];
};

interface PhrasePlayerProps {
  phrase: Phrase;
  onComplete?: () => void;
  className?: string;
}

/**
 * PhrasePlayer Component
 * 
 * A word-synchronized audio player designed for children with reading difficulties.
 * Features smooth visual highlighting that follows audio playback in real-time.
 * 
 * SYNCHRONIZATION LOGIC:
 * The component uses the native <audio> element's onTimeUpdate event to track 
 * playback position. For each time update (~4x per second), we perform a linear 
 * search through the wordTimings array to find which word's time interval contains
 * the current playback time. When the active word changes, React re-renders only
 * the affected word elements, ensuring smooth performance.
 * 
 * ACCESSIBILITY DECISIONS:
 * - Large, high-contrast text (3xl/4xl) suitable for children with dyslexia
 * - Smooth 200ms transitions prevent jarring visual changes
 * - ARIA labels and live regions for screen reader support
 * - Touch-friendly button sizes (minimum 48x48px)
 * - Clear visual feedback for all interactive states
 * - Yellow highlighting (high visibility, non-threatening color)
 * 
 * @component
 * @example
 * const phrase = {
 *   id: 1,
 *   text: "A lua.",
 *   audioFile: "/audios/a-lua.mp3",
 *   wordTimings: [
 *     { word: "A", start: 0, end: 1.0 },
 *     { word: "lua.", start: 1.0, end: 2.0 }
 *   ]
 * };
 * <PhrasePlayer phrase={phrase} onComplete={() => console.log('Done!')} />
 */
export default function PhrasePlayer({ 
  phrase, 
  onComplete,
  className = '' 
}: PhrasePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  /**
   * Determines which word should be highlighted based on current playback time.
   * Uses a simple linear search that's efficient for small word arrays.
   * 
   * Time complexity: O(n) where n = number of words
   * For typical phrases (5-15 words), this is negligible and more readable
   * than binary search alternatives.
   * 
   * @param currentTime - Current audio playback time in seconds
   * @returns Index of the active word, or -1 if no word is active
   */
  const findActiveWordIndex = (currentTime: number): number => {
    return phrase.wordTimings.findIndex(
      (timing) => currentTime >= timing.start && currentTime < timing.end
    );
  };

  /**
   * Core synchronization handler - called repeatedly during playback.
   * Updates the highlighted word based on current playback position.
   * 
   * Performance note: This runs frequently (typically ~4 times per second),
   * but React's reconciliation ensures only necessary DOM updates occur.
   * We also guard against redundant state updates by checking if the word
   * has actually changed.
   */
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const activeIndex = findActiveWordIndex(currentTime);

    // Only update state if the word has actually changed
    // This prevents unnecessary re-renders and ensures smooth performance
    if (activeIndex !== currentWordIndex) {
      setCurrentWordIndex(activeIndex);
    }
  };

  /**
   * Handles audio playback completion
   */
  const handleEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    setCurrentWordIndex(-1);
    onComplete?.();
  };

  /**
   * Toggle play/pause state
   */
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset if audio has ended
      if (hasEnded) {
        audioRef.current.currentTime = 0;
        setHasEnded(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  /**
   * Reset playback to beginning
   */
  const handleReplay = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setCurrentWordIndex(-1);
    setHasEnded(false);
    audioRef.current.play();
    setIsPlaying(true);
  };

  /**
   * Cleanup: pause audio when component unmounts
   * This prevents audio from continuing to play after navigation
   */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={`flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto ${className}`}>
      {/* Audio element - hidden but essential for playback */}
      <audio
        ref={audioRef}
        src={phrase.audioFile}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
        aria-label={`Áudio da frase: ${phrase.text}`}
      />

      {/* 
        Word display area
        
        Accessibility considerations:
        - Large, readable text (text-3xl on mobile, text-4xl on desktop)
        - High contrast colors (gray-900 on yellow-300 for active, gray-700 for inactive)
        - Smooth transitions (transition-all duration-200) prevent visual jarring
        - Clear visual feedback for active word (background, scale, shadow)
        - aria-live="polite" announces changes to screen readers without interruption
        - aria-current marks the actively spoken word for assistive technologies
      */}
      <div
        className="flex flex-wrap justify-center items-center gap-3 p-8 bg-white rounded-lg shadow-sm border-2 border-gray-100 min-h-[120px]"
        role="region"
        aria-live="polite"
        aria-label="Texto com destaque sincronizado"
      >
        {phrase.wordTimings.map((timing, index) => (
          <span
            key={`${phrase.id}-word-${index}`}
            className={`
              text-3xl sm:text-4xl font-bold
              transition-all duration-200 ease-in-out
              px-2 py-1 rounded-md
              ${
                currentWordIndex === index
                  ? "bg-yellow-300 text-gray-900 scale-110 shadow-md"
                  : "text-gray-700"
              }
            `}
            // Accessibility: announce currently highlighted word
            aria-current={currentWordIndex === index ? "true" : "false"}
          >
            {timing.word}
          </span>
        ))}
      </div>

      {/* 
        Control buttons
        
        UX decisions:
        - Large touch targets (min 48x48px per WCAG guidelines)
        - Clear visual states (hover, active, disabled)
        - Icon + text for clarity (multimodal communication)
        - Primary action (Play/Pause) emphasized with blue color
        - Secondary action (Replay) uses neutral gray
        - Disabled state clearly communicated via opacity
      */}
      <div className="flex gap-4">
        <button
          onClick={togglePlayback}
          className="
            flex items-center gap-2 px-6 py-3 
            bg-blue-500 hover:bg-blue-600 active:bg-blue-700
            text-white font-semibold rounded-lg
            transition-colors duration-150
            shadow-md hover:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            min-w-[140px] justify-center
          "
          aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
        >
          {isPlaying ? (
            <>
              <PauseIcon />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <PlayIcon />
              <span>{hasEnded ? "Reproduzir" : "Iniciar"}</span>
            </>
          )}
        </button>

        <button
          onClick={handleReplay}
          disabled={!hasEnded && currentWordIndex === -1}
          className="
            flex items-center gap-2 px-6 py-3
            bg-gray-200 hover:bg-gray-300 active:bg-gray-400
            text-gray-800 font-semibold rounded-lg
            transition-colors duration-150
            shadow-md hover:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            min-w-[140px] justify-center
          "
          aria-label="Reproduzir novamente desde o início"
        >
          <ReplayIcon />
          <span>Repetir</span>
        </button>
      </div>

      {/* Visual feedback for playback state */}
      <div className="text-sm text-gray-500 font-medium">
        {isPlaying && "🔊 A reproduzir..."}
        {hasEnded && "✓ Concluído"}
      </div>
    </div>
  );
}

/**
 * Simple SVG icons for better visual communication
 * These are inline to avoid external dependencies
 * Icons are from Heroicons (MIT license)
 */
const PlayIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
  </svg>
);

const ReplayIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
      clipRule="evenodd"
    />
  </svg>
);</content>
<parameter name="filePath">/Users/vitorclara/Discoveryy/Codigos/git/discovery_app/components/practice/PhrasePlayer.tsx