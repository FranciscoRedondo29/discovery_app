"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Play, Check, SkipForward, Volume2, Loader2, Pause } from "lucide-react";
// TODO: reativar TTS quando necessário
// import { useDictationAudio } from "@/hooks/useDictationAudio";
import { DictationEvaluator, type DictationResult } from "@/lib/logic/DictationEvaluator";
import { DictationFeedback } from "@/components/practice/DictationFeedback";
import { getRandomExercise, insertDictationMetrics } from "@/lib/exercises";
import type { Exercise, DifficultyPT, DifficultyEN } from "@/types/exercises";
import { DIFFICULTY_LABELS, difficultyPTtoEN, difficultyENtoPT } from "@/types/exercises";
import { supabase } from "@/lib/supabaseClient";

type Status = "listening" | "evaluating" | "completed";

function DictationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get difficulty from URL or default to 'medio'
  const getDifficultyFromURL = (): DifficultyPT => {
    const nivel = searchParams.get('nivel') as DifficultyPT | null;
    if (nivel && ['facil', 'medio', 'dificil'].includes(nivel)) {
      return nivel;
    }
    return 'medio';
  };

  // State management
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<DictationResult | null>(null);
  const [status, setStatus] = useState<Status>("listening");
  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const [error, setError] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyPT>(getDifficultyFromURL());
  const [metricsSaved, setMetricsSaved] = useState(false);
  const [seenExerciseIds, setSeenExerciseIds] = useState<string[]>([]);
  
  // Local audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TODO: reativar TTS quando necessário
  // const { play, isPlaying, isLoading: audioLoading, stop } = useDictationAudio();

  // Load exercise on mount and when difficulty changes
  useEffect(() => {
    loadNewExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]);

  // Apply playback speed when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  async function loadNewExercise() {
    setIsLoadingExercise(true);
    setError("");
    setUserInput("");
    setResult(null);
    setStatus("listening");
    setMetricsSaved(false);
    setAudioError(null);
    
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    try {
      const difficultyEN = difficultyPTtoEN(selectedDifficulty);
      const exercise = await getRandomExercise(difficultyEN, seenExerciseIds);
      if (exercise) {
        setCurrentExercise(exercise);
        // Add to seen list
        setSeenExerciseIds(prev => [...prev, exercise.id]);
      } else {
        setError(`Nenhum exercício disponível para o nível ${DIFFICULTY_LABELS[selectedDifficulty]}`);
      }
    } catch (err) {
      console.error("Error loading exercise:", err);
      setError("Erro ao carregar exercício");
    } finally {
      setIsLoadingExercise(false);
    }
  }

  const handlePlayAudio = async () => {
    if (!currentExercise) return;

    try {
      setAudioError(null);
      
      // Stop current audio if playing
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      // Build audio path from exercise content
      // Trim whitespace and newlines from content
      const cleanContent = currentExercise.content.trim();
      const audioSrc = `/audios/${cleanContent}.m4a`;
      
      console.log('[Dictation] Audio path:', audioSrc);
      console.log('[Dictation] Exercise content cleaned:', cleanContent);
      
      // Create or reuse audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(audioSrc);
      } else {
        audioRef.current.src = audioSrc;
      }

      // Apply playback speed
      audioRef.current.playbackRate = playbackSpeed;

      // Set up event listeners
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };

      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        setAudioError("Áudio não disponível para este exercício");
        setIsPlaying(false);
      };

      // Play audio
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing audio:", err);
      setAudioError("Erro ao reproduzir áudio");
      setIsPlaying(false);
    }
  };

  const handleEvaluate = async () => {
    if (!currentExercise || !userInput.trim()) return;

    setStatus("evaluating");

    try {
      const evaluationResult = DictationEvaluator.evaluate(
        currentExercise.content,
        userInput
      );
      setResult(evaluationResult);
      setStatus("completed");

      // Save metrics to database (non-blocking)
      saveDictationMetrics(evaluationResult);
    } catch (err) {
      console.error("Error evaluating:", err);
      setError("Erro ao avaliar o ditado");
      setStatus("listening");
    }
  };

  const saveDictationMetrics = async (evaluationResult: DictationResult) => {
    // Avoid duplicate inserts
    if (metricsSaved) {
      console.log('[saveDictationMetrics] Metrics already saved, skipping');
      return;
    }

    try {
      // Get authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.warn('[saveDictationMetrics] No authenticated user, skipping metrics save');
        return;
      }

      const difficultyEN = difficultyPTtoEN(selectedDifficulty);

      const result = await insertDictationMetrics({
        studentId: session.user.id,
        exerciseId: currentExercise?.id,
        difficulty: difficultyEN,
        correctCount: evaluationResult.correctWords,
        errorCount: evaluationResult.substitutionErrors,
        missingCount: evaluationResult.omissionErrors,
        extraCount: evaluationResult.insertionErrors,
        accuracyPercent: evaluationResult.accuracyPercentage,
        details: evaluationResult.detailedDiff,
        transcript: userInput,
      });

      if (result.success) {
        setMetricsSaved(true);
        console.log('[saveDictationMetrics] ✓ Metrics saved successfully');
      } else {
        console.error('[saveDictationMetrics] Failed to save metrics:', result.error);
      }
    } catch (err) {
      console.error('[saveDictationMetrics] Error saving metrics:', err);
      // Non-blocking: don't show error to user, just log it
    }
  };

  const handleNextExercise = () => {
    loadNewExercise();
  };

  const handleDifficultyChange = (difficulty: DifficultyPT) => {
    setSelectedDifficulty(difficulty);
    // Reset seen exercises when changing difficulty
    setSeenExerciseIds([]);
    // Update URL query param
    const url = new URL(window.location.href);
    url.searchParams.set('nivel', difficulty);
    router.push(url.pathname + url.search, { scroll: false });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 70) return "bg-yellow-50 border-yellow-200";
    return "bg-orange-50 border-orange-200";
  };

  if (isLoadingExercise) {
    return (
      <div className="min-h-screen bg-soft-yellow flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
          <p className="text-text-primary/70">A carregar exercício...</p>
        </div>
      </div>
    );
  }

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
                Ditado
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {/* Difficulty Selector */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Nível de Dificuldade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {(['facil', 'medio', 'dificil'] as DifficultyPT[]).map((diff) => (
                  <Button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    disabled={isLoadingExercise || status === "evaluating"}
                    variant={selectedDifficulty === diff ? "default" : "outline"}
                    className={`
                      flex-1 min-w-[100px] font-semibold
                      ${selectedDifficulty === diff 
                        ? 'bg-primary-yellow text-text-primary hover:bg-primary-yellow/90' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-text-primary/60 mt-3 text-center">
                Selecionado: <span className="font-semibold">{DIFFICULTY_LABELS[selectedDifficulty]}</span>
              </p>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Audio Section */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary-yellow" />
                  Ouvir Frase
                </CardTitle>
                {currentExercise && (
                  <span className="text-sm font-semibold text-primary-yellow bg-primary-yellow/10 px-3 py-1 rounded-full">
                    Exercício #{currentExercise.number}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handlePlayAudio}
                disabled={isLoadingExercise || !currentExercise || status === "completed"}
                size="lg"
                className="w-full bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold py-8 text-xl"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-6 w-6 mr-3" />
                    Pausar Áudio
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 mr-3" />
                    Reproduzir Áudio
                  </>
                )}
              </Button>
              
              {/* Audio Error Display */}
              {audioError && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-600 text-sm text-center">{audioError}</p>
                </div>
              )}
              
              {/* Playback Speed Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary/70">
                    Velocidade de Reprodução
                  </label>
                  <span className="text-sm font-semibold text-primary-yellow">
                    {playbackSpeed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-yellow"
                  disabled={status === "completed"}
                />
                <div className="flex justify-between text-xs text-text-primary/50">
                  <span>0.5x (Lento)</span>
                  <span>1.0x (Normal)</span>
                  <span>1.5x (Rápido)</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-text-primary/60">
                Clica para ouvir a frase. Podes ouvir quantas vezes quiseres.
              </p>
            </CardContent>
          </Card>

          {/* Input or Result Section */}
          {status === "completed" && result ? (
            /* Result View */
            <Card className="border-2 border-primary-yellow/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Resultado</CardTitle>
                  <div
                    className={`px-4 py-2 rounded-lg border-2 ${getScoreBgColor(
                      result.accuracyPercentage
                    )}`}
                  >
                    <span
                      className={`text-2xl font-bold ${getScoreColor(
                        result.accuracyPercentage
                      )}`}
                    >
                      {result.accuracyPercentage}%
                    </span>
                    <span className="text-sm text-text-primary/70 ml-2">
                      Acerto
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New Detailed Visual Feedback */}
                <DictationFeedback tokens={result.detailedDiff} />

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {result.correctWords}
                    </p>
                    <p className="text-xs text-text-primary/60">Corretas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {result.substitutionErrors}
                    </p>
                    <p className="text-xs text-text-primary/60">Erros</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {result.omissionErrors}
                    </p>
                    <p className="text-xs text-text-primary/60">Em falta</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {result.insertionErrors}
                    </p>
                    <p className="text-xs text-text-primary/60">Extras</p>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="text-sm text-text-primary/70 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium mb-2">Como ler o feedback:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Palavras <span className="font-semibold text-green-600">verdes a negrito</span> são as que devias ter escrito mas faltaram</li>
                    <li>Palavras <span className="bg-red-100 text-red-600 px-1 rounded line-through">riscadas a vermelho</span> são erros que escreveste</li>
                    <li>Palavras normais estão corretas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Input View */
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Escreve o que ouviste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escreve aqui o que ouviste..."
                  disabled={status === "evaluating"}
                  className="min-h-[200px] text-xl resize-none"
                  style={{ fontFamily: "OpenDyslexic, Arial, sans-serif" }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <p className="text-sm text-text-primary/60">
                  Escreve a frase completa que ouviste. Depois clica em &quot;Corrigir&quot;.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {status === "completed" ? (
              <Button
                onClick={handleNextExercise}
                size="lg"
                className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold min-w-[250px]"
              >
                <SkipForward className="h-5 w-5 mr-2" />
                Próximo Exercício
              </Button>
            ) : (
              <Button
                onClick={handleEvaluate}
                disabled={
                  !userInput.trim() ||
                  status === "evaluating" ||
                  isLoadingExercise
                }
                size="lg"
                className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold min-w-[250px]"
              >
                {status === "evaluating" ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    A avaliar...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Corrigir
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-text-primary/60 space-y-1">
            <p>
              <strong>Dica:</strong> Ouve com atenção e escreve exatamente o que ouves.
            </p>
            <p>Não te preocupes com maiúsculas ou pontuação!</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DictationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-soft-yellow flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
          <p className="text-text-primary/70">A carregar...</p>
        </div>
      </div>
    }>
      <DictationPageContent />
    </Suspense>
  );
}
