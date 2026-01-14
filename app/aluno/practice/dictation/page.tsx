"use client";

import { startTransition, useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, SkipForward, Loader2 } from "lucide-react";
// TODO: reativar TTS quando necessário
// import { useDictationAudio } from "@/hooks/useDictationAudio";
import { DictationEvaluator } from "@/lib/logic/evaluation/DictationEvaluator";
import { EvaluationMetrics } from "@/lib/logic/evaluation/types";
import { getRandomExercise, getAllExercises, insertDictationMetrics } from "@/lib/exercises";
import type { Exercise, DifficultyPT, DifficultyEN } from "@/types/exercises";
import { DIFFICULTY_LABELS, difficultyPTtoEN, difficultyENtoPT } from "@/types/exercises";
import { supabase } from "@/lib/supabaseClient";

// Sub-components
import { DifficultySelector } from "@/components/practice/dictation/DifficultySelector";
import { DictationAudioPlayer } from "@/components/practice/dictation/DictationAudioPlayer";
import { DictationInputArea } from "@/components/practice/dictation/DictationInputArea";
import { DictationResultsView } from "@/components/practice/dictation/DictationResultsView";

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
  const [result, setResult] = useState<EvaluationMetrics | null>(null);
  const [status, setStatus] = useState<Status>("listening");
  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const [error, setError] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyPT>(getDifficultyFromURL());
  const [metricsSaved, setMetricsSaved] = useState(false);
  const [seenExerciseIds, setSeenExerciseIds] = useState<string[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  
  // Local audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load exercise on mount and when difficulty changes
  useEffect(() => {
    loadAllExercises();
    loadNewExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]);

  async function loadAllExercises() {
    const difficultyEN = difficultyPTtoEN(selectedDifficulty);
    const exercises = await getAllExercises(difficultyEN);
    setAllExercises(exercises);
  }

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

  async function loadSpecificExercise(exerciseId: string) {
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
      const exercise = allExercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        setCurrentExercise(exercise);
        // Add to seen list if not already there
        if (!seenExerciseIds.includes(exerciseId)) {
          setSeenExerciseIds(prev => [...prev, exerciseId]);
        }
      } else {
        setError("Exercício não encontrado");
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

  const handlePlayPause = async () => {
      if (isPlaying) {
          if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
          }
      } else {
          await handlePlayAudio();
      }
  }

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

  const saveDictationMetrics = async (evaluationResult: EvaluationMetrics) => {
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

      // Map EvaluationMetrics to the existing database schema structure
      const result = await insertDictationMetrics({
        studentId: session.user.id,
        exerciseId: currentExercise?.id,
        difficulty: difficultyEN,
        correctCount: evaluationResult.correctWords,
        // Using letter substitution + other error types as a proxy for "error count"
        // Note: We now only count full word substitutions as "errors" for the summary stats
        // Letter errors, joins, and splits are detailed in the JSON but don't count as full word substitutions
        errorCount: evaluationResult.totalWordSubstitutions,
        missingCount: evaluationResult.omittedWords, 
        extraCount: evaluationResult.extraWords,     
        accuracyPercent: evaluationResult.accuracyPercentage,
        
        // Detailed granular metrics
        letterOmissionCount: evaluationResult.totalLettersOmitted,
        letterInsertionCount: evaluationResult.totalLettersInserted,
        letterSubstitutionCount: evaluationResult.totalLettersSubstituted,
        transpositionCount: evaluationResult.totalLettersTransposed,
        splitJoinCount: evaluationResult.totalWordJoins + evaluationResult.totalWordSplits,
        punctuationErrorCount: evaluationResult.totalPunctuationErrors,
        capitalizationErrorCount: evaluationResult.totalCapErrors,
        errorWords: evaluationResult.wordDetails
            .filter(w => {
              // Palavra deve estar errada
              if (w.status !== 'wrong' || !w.originalWord) return false;
              
              // Se o único problema for Capitalização, NÃO incluir
              const onlyCapError = w.caseError !== 'none' && 
                                   w.punctuationError === 'none' && 
                                   w.letterErrors.length === 0 &&
                                   w.errorTypes.length === 0; // split/join aparecem em errorTypes

              if (onlyCapError) return false;

              // Se for erro de Separação/Junção, NÃO incluir (pedido explícito do user)
              const isStructural = w.errorTypes.includes('split_word_error') || 
                                   w.errorTypes.includes('merge_word_error');
              
              if (isStructural) return false;

              return true;
            })
            .map(w => w.originalWord),
        resolution: userInput,
      });

      if (result.success) {
        setMetricsSaved(true);
        // Mark exercise as completed
        if (currentExercise?.id) {
          setCompletedExercises(prev => new Set(Array.from(prev).concat(currentExercise.id)));
        }
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
    setCompletedExercises(new Set());
    // Update URL query param
    const url = new URL(window.location.href);
    url.searchParams.set('nivel', difficulty);
    router.push(url.pathname + url.search, { scroll: false });
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
          
          <DifficultySelector 
              selectedDifficulty={selectedDifficulty}
              onSelect={handleDifficultyChange}
              disabled={isLoadingExercise || status === "evaluating"}
          />

          {/* Progress Indicator - Bolinhas */}
          {allExercises.length > 0 && (
            <div className="flex justify-center">
              <div className="flex gap-3">
                {allExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => loadSpecificExercise(exercise.id)}
                    disabled={status === "evaluating" || isLoadingExercise}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 cursor-pointer hover:scale-125 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      completedExercises.has(exercise.id)
                        ? 'bg-green-500'
                        : exercise.id === currentExercise?.id
                        ? 'bg-gray-400 ring-2 ring-gray-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`Exercício ${exercise.number || exercise.id}: ${exercise.content}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <DictationAudioPlayer 
              currentExercise={currentExercise}
              isLoading={isLoadingExercise}
              status={status}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              audioError={audioError}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
          />

          {/* Input or Result Section */}
          {status === "completed" && result ? (
              <DictationResultsView metrics={result} />
          ) : (
              <DictationInputArea 
                  value={userInput}
                  onChange={setUserInput}
                  disabled={status === "evaluating"}
              />
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
