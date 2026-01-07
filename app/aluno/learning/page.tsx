"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, SkipForward, Settings, RefreshCw } from "lucide-react";
import { useHighlightPlayback } from "@/hooks/useHighlightPlayback";
import { useWordHighlight } from "@/hooks/useWordHighlight";
import { PHRASES, getRandomPhrase, getPhrasesByLevel } from "@/lib/phrases";
import type { Exercise, Phrase } from "@/types/exercises";

type Difficulty = "easy" | "medium" | "hard";

export default function LearningPage() {
  const router = useRouter();

  // State management
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [fontSize, setFontSize] = useState("text-2xl");
  const [currentText, setCurrentText] = useState("");
  const [syllables, setSyllables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");
  const [selectedPhraseId, setSelectedPhraseId] = useState<number | null>(null);
  const [showSyllables, setShowSyllables] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [hasFinishedPlayback, setHasFinishedPlayback] = useState(false);
  const [isPlaybackStarted, setIsPlaybackStarted] = useState(false);

  // Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Highlight playback hook for syllables mode
  const highlight = useHighlightPlayback();
  
  // Word highlight hook for phrase mode (0.3s per syllable per word)
  const wordHighlight = useWordHighlight();

  // Detect when playback finishes to enable next button and mark as complete
  useEffect(() => {
    // If playback was started and now both are not playing, it means playback finished
    if (isPlaybackStarted && !highlight.isPlaying && !wordHighlight.isPlaying) {
      setHasFinishedPlayback(true);
      setIsPlaybackStarted(false);
      // Mark current exercise as completed
      if (currentPhrase) {
        setCompletedExercises(prev => new Set(Array.from(prev).concat(currentPhrase.id)));
      }
    }
  }, [highlight.isPlaying, wordHighlight.isPlaying, isPlaybackStarted, currentPhrase]);

  // Font size options
  const fontSizeOptions = [
    { label: "Pequeno", value: "text-xl", size: 20 },
    { label: "Médio", value: "text-2xl", size: 24 },
    { label: "Grande", value: "text-3xl", size: 30 },
    { label: "Muito Grande", value: "text-4xl", size: 36 },
  ];

  const currentFontIndex = fontSizeOptions.findIndex((opt) => opt.value === fontSize);

  // Load initial phrase on mount
  useEffect(() => {
    loadNextPhrase();
  }, []);

  // Parse syllables from currentPhrase when it changes
  useEffect(() => {
    if (currentPhrase && currentPhrase.syllables) {
      // Parse syllables string: "O Pe-dro pin-ta" -> ["O", "Pe", "dro", "pin", "ta"]
      const syllableArray = currentPhrase.syllables
        .split(/\s+/)
        .flatMap(word => word.split('-'))
        .filter(s => s.length > 0);
      setSyllables(syllableArray);
      highlight.reset();
    }
  }, [currentPhrase, highlight]);

  function loadNextPhrase() {
    setIsLoading(true);
    setError("");
    setShowSyllables(false);
    highlight.reset();
    try {
      const phrasesForLevel = getPhrasesByLevel(difficulty);
      
      // Find next phrase in sequence
      let nextPhrase;
      if (!currentPhrase) {
        // Load first phrase
        nextPhrase = phrasesForLevel[0];
      } else {
        // Find current index and get next one
        const currentIndex = phrasesForLevel.findIndex(p => p.id === currentPhrase.id);
        if (currentIndex >= 0 && currentIndex < phrasesForLevel.length - 1) {
          nextPhrase = phrasesForLevel[currentIndex + 1];
        } else {
          // Loop back to start
          nextPhrase = phrasesForLevel[0];
        }
      }
      
      setCurrentText(nextPhrase.text);
      setCurrentPhrase(nextPhrase);
      setSelectedPhraseId(nextPhrase.id);
    } catch (err) {
      console.error("Error loading phrase:", err);
      setError("Erro ao carregar frase");
    } finally {
      setIsLoading(false);
    }
  }

  function loadSelectedPhrase(phraseId: number) {
    const phrase = PHRASES.find((p: Phrase) => p.id === phraseId);
    if (phrase) {
      setCurrentText(phrase.text);
      setCurrentPhrase(phrase);
      setSelectedPhraseId(phraseId);
      setShowSyllables(false);
      highlight.reset();
      wordHighlight.reset();
    }
  }

  const handlePlayPause = () => {
    // Play audio if available
    if (currentPhrase?.audioFile) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(currentPhrase.audioFile);
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
    }

    if (showSyllables) {
      // Syllable mode: use highlight hook
      if (highlight.isPlaying) {
        highlight.pause();
        if (audioRef.current) audioRef.current.pause();
      } else {
        if (currentPhrase && currentPhrase.syllables) {
          highlight.play(currentPhrase.syllables);
          setIsPlaybackStarted(true);
        }
      }
    } else {
      // Phrase mode: use word highlight hook with wordTimings from audio
      if (wordHighlight.isPlaying) {
        wordHighlight.pause();
        if (audioRef.current) audioRef.current.pause();
      } else {
        if (currentPhrase && currentPhrase.wordTimings) {
          wordHighlight.play(currentPhrase.wordTimings);
          setIsPlaybackStarted(true);
        }
      }
    }
  };

  const handleToggleSyllables = () => {
    // Stop any playing highlight when toggling
    highlight.pause();
    wordHighlight.pause();
    setShowSyllables(!showSyllables);
  };

  const handleNextSentence = () => {
    highlight.reset();
    wordHighlight.reset();
    setShowSyllables(false);
    setHasFinishedPlayback(false);
    setIsPlaybackStarted(false);
    loadNextPhrase();
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setShowSyllables(false);
    highlight.reset();
    wordHighlight.reset();
    setCompletedExercises(new Set()); // Clear progress when changing difficulty
    setHasFinishedPlayback(false);
    setIsPlaybackStarted(false);
    // Load first phrase from new difficulty
    const phrasesForLevel = getPhrasesByLevel(newDifficulty);
    const firstPhrase = phrasesForLevel[0];
    setCurrentText(firstPhrase.text);
    setCurrentPhrase(firstPhrase);
    setSelectedPhraseId(firstPhrase.id);
  };

  const handleIncreaseFontSize = () => {
    if (currentFontIndex < fontSizeOptions.length - 1) {
      setFontSize(fontSizeOptions[currentFontIndex + 1].value);
    }
  };

  const handleDecreaseFontSize = () => {
    if (currentFontIndex > 0) {
      setFontSize(fontSizeOptions[currentFontIndex - 1].value);
    }
  };

  const handleSyllableClick = (index: number) => {
    // For now, just log the syllable click
    // Future: Could implement individual syllable playback
    console.log(`Clicked syllable ${index}: ${syllables[index]}`);
  };

  return (
    <div className="min-h-screen bg-[#FEFCE8] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/aluno">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Modo de Leitura
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
            className="border-primary-yellow text-text-primary hover:bg-soft-yellow rounded-lg px-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Definições
          </Button>
        </div>
      </header>

      {/* Difficulty Levels Section */}
      <div className="px-6 py-6 bg-white mx-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nível de Dificuldade</h2>
        <div className="flex gap-3 items-center">
          <Button
            onClick={() => handleDifficultyChange('easy')}
            variant="outline"
            className={`flex-1 rounded-xl border-2 font-semibold py-3 ${
              difficulty === 'easy' 
                ? 'bg-[#E5A534] border-[#E5A534] text-gray-900' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            Fácil
          </Button>
          <Button
            onClick={() => handleDifficultyChange('medium')}
            variant="outline"
            className={`flex-1 rounded-xl border-2 font-semibold py-3 ${
              difficulty === 'medium' 
                ? 'bg-[#E5A534] border-[#E5A534] text-gray-900' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            Médio
          </Button>
          <Button
            onClick={() => handleDifficultyChange('hard')}
            variant="outline"
            className={`flex-1 rounded-xl border-2 font-semibold py-3 ${
              difficulty === 'hard' 
                ? 'bg-[#E5A534] border-[#E5A534] text-gray-900' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            Difícil
          </Button>
        </div>
        <p className="text-sm text-gray-500 text-center mt-3">
          Selecionado: {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 py-4 flex justify-center">
        <div className="flex gap-3">
          {getPhrasesByLevel(difficulty).map((phrase) => (
            <button
              key={phrase.id}
              onClick={() => {
                // Stop any playing audio/highlight
                highlight.reset();
                wordHighlight.reset();
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current = null;
                }
                setHasFinishedPlayback(false);
                setIsPlaybackStarted(false);
                setShowSyllables(false);
                // Load selected phrase
                setCurrentText(phrase.text);
                setCurrentPhrase(phrase);
                setSelectedPhraseId(phrase.id);
              }}
              className={`w-3 h-3 rounded-full transition-colors duration-300 cursor-pointer hover:scale-125 ${
                completedExercises.has(phrase.id)
                  ? 'bg-green-500'
                  : phrase.id === currentPhrase?.id
                  ? 'bg-green-300 ring-2 ring-green-400'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Exercício ${phrase.id}: ${phrase.text}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-8 max-w-6xl w-full">
          {/* Reading Area Card */}
          <Card className="border rounded-2xl shadow-sm bg-white overflow-hidden min-h-[400px] w-full max-w-4xl flex flex-col justify-center relative">
            {/* Restart Button */}
            <button
              onClick={() => {
                // Reset playback
                highlight.reset();
                wordHighlight.reset();
                setHasFinishedPlayback(false);
                setIsPlaybackStarted(false);
                setShowSyllables(false);
                // Clear all progress (bolinhas)
                setCompletedExercises(new Set());
                // Go back to first phrase
                const phrasesForLevel = getPhrasesByLevel(difficulty);
                const firstPhrase = phrasesForLevel[0];
                setCurrentText(firstPhrase.text);
                setCurrentPhrase(firstPhrase);
                setSelectedPhraseId(firstPhrase.id);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Reiniciar tudo"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <CardContent className="p-8 h-full flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="text-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
                  <p className="text-text-primary/70 mt-4">A carregar exercício...</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-8">
                  {/* Full sentence (small, top) */}
                  <div className="w-full flex flex-col items-center gap-4">
                    <div 
                      className="text-lg text-gray-400 font-medium text-center"
                      style={{ fontFamily: "'OpenDyslexic', sans-serif" }}
                    >
                      {currentText}
                    </div>
                    <div className="w-24 h-[1px] bg-gray-200"></div>
                  </div>

                  {/* Main display - conditional rendering */}
                  {showSyllables ? (
                    // Syllables mode (large, separated with highlighting)
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 min-h-[150px] px-10">
                      {syllables.map((syllable, index) => (
                        <span
                          key={`${index}-${syllable}`}
                          className={`
                            text-4xl md:text-5xl font-bold transition-all duration-200 tracking-wider
                            ${
                              highlight.isPlaying && highlight.currentSyllableIndex === index
                                ? "text-white bg-primary-yellow px-4 py-2 rounded-xl scale-110 shadow-lg"
                                : "text-gray-800"
                            }
                          `}
                          style={{
                            fontFamily: "'OpenDyslexic', sans-serif",
                          }}
                        >
                          {syllable}
                        </span>
                      ))}
                    </div>
                  ) : (
                    // Full phrase mode (words with highlighting based on syllable count)
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 min-h-[150px] px-10">
                      {currentText.split(/\s+/).map((word, index) => (
                        <span
                          key={`${index}-${word}`}
                          className={`
                            text-4xl md:text-5xl font-bold transition-all duration-200 tracking-wider
                            ${
                              wordHighlight.isPlaying && wordHighlight.currentWordIndex === index
                                ? "text-white bg-primary-yellow px-4 py-2 rounded-xl scale-110 shadow-lg"
                                : "text-gray-800"
                            }
                          `}
                          style={{
                            fontFamily: "'OpenDyslexic', sans-serif",
                          }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls - now below the card */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              {/* Play/Pause Button */}
              <Button
                onClick={handlePlayPause}
                disabled={isLoading || !currentPhrase}
                className="bg-[#E5A534] text-gray-900 hover:bg-[#E5A534]/90 font-bold text-lg px-8 py-6 rounded-2xl shadow-sm min-w-[200px]"
              >
                {(showSyllables ? highlight.isPlaying : wordHighlight.isPlaying) ? (
                  <>
                    <Pause className="h-5 w-5 mr-2 fill-current" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2 fill-current" />
                    Reproduzir
                  </>
                )}
              </Button>

              {/* Next Sentence Button */}
              <Button
                onClick={handleNextSentence}
                disabled={isLoading || !hasFinishedPlayback}
                variant="outline"
                className={`font-bold text-lg px-8 py-6 rounded-2xl shadow-sm min-w-[200px] ${
                  hasFinishedPlayback
                    ? 'bg-white border-gray-300 border-2 text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-100 border-gray-200 border-2 text-gray-400 cursor-not-allowed'
                }`}
              >
                <SkipForward className="h-5 w-5 mr-2" />
                Próxima Frase
              </Button>
            </div>
            
            {/* Info Text */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Nível: <span className="font-medium capitalize">{difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'}</span>
              </p>
              <p className="text-xs text-gray-400">Clica em &quot;Reproduzir&quot; para ouvir a frase com destaque visual</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
