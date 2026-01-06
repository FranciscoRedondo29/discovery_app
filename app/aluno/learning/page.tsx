git status
git commit -m "TTS & STT V1""use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, SkipForward, Settings, Plus, Minus } from "lucide-react";
import { SyllableDivider } from "@/lib/logic/SyllableDivider";
import { useSyllableAudio } from "@/hooks/useSyllableAudio";
import { getRandomExercise } from "@/lib/exercises";
import type { Exercise } from "@/types/exercises";

type Difficulty = "easy" | "medium" | "hard";

export default function LearningPage() {
  const router = useRouter();

  // State management
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [fontSize, setFontSize] = useState("text-2xl");
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [syllables, setSyllables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");

  // Audio hook
  const {
    isPlaying,
    currentSyllableIndex,
    isLoading: audioLoading,
    play,
    pause,
    reset,
  } = useSyllableAudio(syllables, playbackSpeed);

  // Font size options
  const fontSizeOptions = [
    { label: "Pequeno", value: "text-xl", size: 20 },
    { label: "Médio", value: "text-2xl", size: 24 },
    { label: "Grande", value: "text-3xl", size: 30 },
    { label: "Muito Grande", value: "text-4xl", size: 36 },
  ];

  const currentFontIndex = fontSizeOptions.findIndex((opt) => opt.value === fontSize);

  // Fetch exercise when difficulty changes
  useEffect(() => {
    loadNewExercise();
  }, [difficulty]);

  // Split text into syllables when exercise changes
  useEffect(() => {
    if (currentExercise?.content) {
      try {
        const divided = SyllableDivider.split(currentExercise.content);
        setSyllables(divided);
        reset(); // Reset audio state when new exercise loads
      } catch (err) {
        console.error("Error dividing syllables:", err);
        setError("Erro ao processar o texto");
      }
    }
  }, [currentExercise, reset]);

  async function loadNewExercise() {
    setIsLoading(true);
    setError("");
    try {
      const exercise = await getRandomExercise(difficulty);
      if (exercise) {
        setCurrentExercise(exercise);
      } else {
        setError("Nenhum exercício disponível para este nível");
      }
    } catch (err) {
      console.error("Error loading exercise:", err);
      setError("Erro ao carregar exercício");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePlayPause = () => {
    console.log('[handlePlayPause] isPlaying:', isPlaying, 'isLoading:', isLoading);
    
    if (isPlaying) {
      pause();
    } else {
      // Only play if not already loading/playing
      if (!isLoading) {
        play();
      }
    }
  };

  const handleNextSentence = () => {
    reset();
    loadNewExercise();
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
    <div className="min-h-screen bg-soft-yellow flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/aluno")}
                variant="ghost"
                size="sm"
                aria-label="Voltar ao dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold text-text-primary">
                Modo de Leitura
              </h1>
            </div>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
            >
              <Settings className="h-4 w-4 mr-2" />
              Definições
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          {/* Settings Card */}
          {showSettings && (
            <Card className="border-2 border-primary-yellow/30">
              <CardHeader>
                <CardTitle className="text-lg">Definições de Leitura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Difficulty Selection */}
                  <div className="space-y-2">
                    <label
                      htmlFor="difficulty"
                      className="text-sm font-medium text-text-primary"
                    >
                      Dificuldade
                    </label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Médio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>

                  {/* Speed Control */}
                  <div className="space-y-2">
                    <label
                      htmlFor="speed"
                      className="text-sm font-medium text-text-primary"
                    >
                      Velocidade: {playbackSpeed.toFixed(1)}x
                    </label>
                    <input
                      id="speed"
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-yellow"
                    />
                    <div className="flex justify-between text-xs text-text-primary/60">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>1.5x</span>
                    </div>
                  </div>

                  {/* Font Size Control */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">
                      Tamanho da Letra
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleDecreaseFontSize}
                        disabled={currentFontIndex === 0}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-text-primary min-w-[80px] text-center">
                        {fontSizeOptions[currentFontIndex]?.label}
                      </span>
                      <Button
                        onClick={handleIncreaseFontSize}
                        disabled={currentFontIndex === fontSizeOptions.length - 1}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Reading Area */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8 md:p-12">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
                  <p className="text-text-primary/70 mt-4">A carregar exercício...</p>
                </div>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center">
                  <div
                    className={`${fontSize} leading-relaxed text-center max-w-4xl`}
                    style={{ lineHeight: "2.5" }}
                  >
                    {syllables.map((syllable, index) => (
                      <span
                        key={`${index}-${syllable}`}
                        onClick={() => handleSyllableClick(index)}
                        className={`
                          inline-block mx-1 px-2 py-1 rounded-md cursor-pointer
                          transition-all duration-200
                          ${
                            currentSyllableIndex === index
                              ? "bg-primary-yellow text-white font-semibold scale-110 shadow-md"
                              : "hover:bg-gray-100"
                          }
                        `}
                        style={{
                          fontFamily: "OpenDyslexic, Arial, sans-serif",
                        }}
                      >
                        {syllable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls Footer */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Play/Pause Button */}
            <Button
              onClick={handlePlayPause}
              disabled={isLoading || audioLoading || syllables.length === 0}
              size="lg"
              className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold min-w-[200px]"
            >
              {audioLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-text-primary mr-2"></div>
                  A preparar...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Reproduzir
                </>
              )}
            </Button>

            {/* Next Sentence Button */}
            <Button
              onClick={handleNextSentence}
              disabled={isLoading || audioLoading}
              variant="outline"
              size="lg"
              className="border-primary-yellow text-text-primary hover:bg-soft-yellow min-w-[200px]"
            >
              <SkipForward className="h-5 w-5 mr-2" />
              Próxima Frase
            </Button>
          </div>

          {/* Info Text */}
          <div className="text-center text-sm text-text-primary/60 space-y-1">
            <p>
              Nível: <span className="font-medium capitalize">{difficulty}</span>
            </p>
            <p>Clica em "Reproduzir" para ouvir a frase com destaque visual</p>
          </div>
        </div>
      </main>
    </div>
  );
}
