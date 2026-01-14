import React, { useState } from 'react';
import type { WordTiming } from '@/types/exercises';

interface WordWithAudioProps {
  /** The word text to display */
  word: string;
  
  /** Index of this word in the sentence (for highlighting during sentence playback) */
  index: number;
  
  /** Whether this word is currently highlighted during sentence playback */
  isHighlightedBySentence: boolean;
  
  /** Whether this word's audio is currently playing */
  isPlayingWord: boolean;
  
  /** Whether word interactions (hover/click) are enabled */
  interactionsEnabled: boolean;
  
  /** Timing data for extracting this word's audio */
  wordTiming?: WordTiming;
  
  /** Handler for when the word is clicked */
  onWordClick: (word: string, wordTiming: WordTiming) => void;
  
  /** Optional custom class name */
  className?: string;
}

/**
 * WordWithAudio Component
 * 
 * Renders an individual word with interactive audio playback capabilities.
 * 
 * Behavior:
 * - Hover: Visual highlight (only when interactions enabled)
 * - Click: Play word audio (only when interactions enabled)
 * - Sentence playback: Shows synchronized highlight, disables interactions
 * 
 * Accessibility:
 * - Semantic button role when interactive
 * - ARIA labels for screen readers
 * - Keyboard navigation support (Tab + Enter/Space)
 * - Cursor changes to indicate interactivity
 * 
 * UX Decisions:
 * - Hover state is subtle to not distract from sentence playback
 * - Playing word gets strongest visual emphasis (yellow background)
 * - Sentence highlight is secondary (scale + shadow)
 * - Disabled state clearly communicated via cursor
 * 
 * @example
 * <WordWithAudio
 *   word="aluno"
 *   index={1}
 *   isHighlightedBySentence={currentWordIndex === 1}
 *   isPlayingWord={currentPlayingWord === "aluno"}
 *   interactionsEnabled={!isSentencePlaying}
 *   wordTiming={{ word: "aluno", start: 0.5, end: 1.2 }}
 *   onWordClick={handleWordClick}
 * />
 */
export function WordWithAudio({
  word,
  index,
  isHighlightedBySentence,
  isPlayingWord,
  interactionsEnabled,
  wordTiming,
  onWordClick,
  className = '',
}: WordWithAudioProps) {
  // Local hover state (only for visual feedback)
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Handle word click
   * Only triggers if:
   * 1. Interactions are enabled (sentence not playing)
   * 2. Word timing data exists
   */
  const handleClick = () => {
    if (interactionsEnabled && wordTiming) {
      onWordClick(word, wordTiming);
    }
  };

  /**
   * Handle keyboard interaction (Enter or Space)
   * Provides keyboard accessibility
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactionsEnabled && wordTiming && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onWordClick(word, wordTiming);
    }
  };

  /**
   * Determine visual state based on various conditions
   * Priority (highest to lowest):
   * 1. Word audio playing → strongest emphasis
   * 2. Sentence playback highlighting → secondary emphasis
   * 3. Hover (when enabled) → subtle highlight
   * 4. Default state
   */
  const getVisualClasses = () => {
    const baseClasses = 'text-4xl md:text-5xl font-bold transition-all duration-200 tracking-wider';
    
    // Word audio playing - strongest visual state
    if (isPlayingWord) {
      return `${baseClasses} text-white bg-primary-yellow px-4 py-2 rounded-xl scale-110 shadow-xl ring-2 ring-primary-yellow/50`;
    }
    
    // Sentence playback highlighting - secondary emphasis
    if (isHighlightedBySentence) {
      return `${baseClasses} text-white bg-primary-yellow px-4 py-2 rounded-xl scale-110 shadow-lg`;
    }
    
    // Hover state (only when interactions enabled)
    if (isHovered && interactionsEnabled) {
      return `${baseClasses} text-gray-800 scale-105 opacity-80`;
    }
    
    // Default state
    return `${baseClasses} text-gray-800`;
  };

  /**
   * Determine cursor style
   * - pointer: Interactions enabled and word has timing data
   * - not-allowed: Interactions disabled (during sentence playback)
   * - default: No timing data available
   */
  const getCursorClass = () => {
    if (!wordTiming) return 'cursor-default';
    if (interactionsEnabled) return 'cursor-pointer';
    return 'cursor-not-allowed';
  };

  /**
   * ARIA attributes for accessibility
   */
  const ariaProps = {
    role: interactionsEnabled && wordTiming ? 'button' : undefined,
    'aria-label': interactionsEnabled && wordTiming 
      ? `Ouvir palavra: ${word}`
      : undefined,
    'aria-disabled': !interactionsEnabled || !wordTiming,
    tabIndex: interactionsEnabled && wordTiming ? 0 : -1,
  };

  return (
    <span
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${getVisualClasses()}
        ${getCursorClass()}
        ${className}
      `}
      style={{
        fontFamily: "'OpenDyslexic', sans-serif",
      }}
      {...ariaProps}
    >
      {word}
    </span>
  );
}
