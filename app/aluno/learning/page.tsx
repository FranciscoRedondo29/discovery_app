"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    if (showSyllables) {
      // Syllable mode: use highlight hook
      if (highlight.isPlaying) {
        highlight.pause();
      } else {
        if (currentPhrase && currentPhrase.syllables) {
          highlight.play(currentPhrase.syllables);
          setIsPlaybackStarted(true);
        }
      }
    } else {
      // Phrase mode: use word highlight hook (0.3s per syllable per word)
      if (wordHighlight.isPlaying) {
        wordHighlight.pause();
      } else {
        if (currentPhrase && currentPhrase.syllables) {
          wordHighlight.play(currentPhrase.text, currentPhrase.syllables);
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
          <Button
            onClick={() => router.push("/aluno")}
            variant="ghost"
            size="sm"
            className="text-gray-800 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
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
            <div
              key={phrase.id}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                completedExercises.has(phrase.id)
                  ? 'bg-green-500'
                  : phrase.id === currentPhrase?.id
                  ? 'bg-green-300 ring-2 ring-green-400'
                  : 'bg-gray-300'
              }`}
              title={`Exercício ${phrase.id}: ${phrase.text}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex px-4 py-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto space-y-8">

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Reading Area Card */}
          <Card className="border rounded-2xl shadow-sm bg-white overflow-hidden min-h-[500px] flex flex-col justify-center relative">
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
            <CardContent className="p-12 h-full flex flex-col items-center">
              {isLoading ? (
                <div className="text-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
                  <p className="text-text-primary/70 mt-4">A carregar exercício...</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-12">
                  {/* Full sentence (small, top) */}
                  <div className="w-full max-w-md flex flex-col items-center gap-4">
                    <div 
                      className="text-xl text-gray-400 font-medium text-center"
                      style={{ fontFamily: "'OpenDyslexic', sans-serif" }}
                    >
                      {currentText}
                    </div>
                    <div className="w-24 h-[1px] bg-gray-100"></div>
                  </div>

                  {/* Main display - conditional rendering */}
                  {showSyllables ? (
                    // Syllables mode (large, separated with highlighting)
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 min-h-[200px] px-8">
                      {syllables.map((syllable, index) => (
                        <span
                          key={`${index}-${syllable}`}
                          className={`
                            text-5xl md:text-6xl font-bold transition-all duration-200 tracking-wider
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
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 min-h-[200px] px-8">
                      {currentText.split(/\s+/).map((word, index) => (
                        <span
                          key={`${index}-${word}`}
                          className={`
                            text-5xl md:text-6xl font-bold transition-all duration-200 tracking-wider
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
        </div>

        {/* Controls Footer */}
        <div className="flex flex-col items-center gap-6 pb-12">
            <div className="flex gap-4 flex-wrap justify-center">
              {/* Play/Pause Button */}
              <Button
                onClick={handlePlayPause}
                disabled={isLoading || !currentPhrase}
                className="bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90 font-bold text-lg px-8 py-7 rounded-2xl shadow-sm min-w-[220px]"
              >
                {(showSyllables ? highlight.isPlaying : wordHighlight.isPlaying) ? (
                  <>
                    <Pause className="h-6 w-6 mr-3 fill-current" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 mr-3 fill-current" />
                    Reproduzir
                  </>
                )}
              </Button>

              {/* Next Sentence Button */}
              <Button
                onClick={handleNextSentence}
                disabled={isLoading || !hasFinishedPlayback}
                variant="outline"
                className={`font-bold text-lg px-8 py-7 rounded-2xl shadow-sm min-w-[220px] ${
                  hasFinishedPlayback
                    ? 'bg-white border-primary-yellow border-2 text-gray-900 hover:bg-white/90'
                    : 'bg-gray-200 border-gray-300 border-2 text-gray-400 cursor-not-allowed'
                }`}
              >
                <SkipForward className="h-6 w-6 mr-3" />
                Próxima Frase
              </Button>            </div>
          {/* Info Text */}
          <div className="text-center text-sm text-text-primary/60 space-y-1">
            <p>
              Nível: <span className="font-medium capitalize">{difficulty}</span>
            </p>
            <p>Clica em &quot;Reproduzir&quot; para ouvir a frase com destaque visual</p>
          </div>
        </div>
      </main>
    </div>
  );
}
