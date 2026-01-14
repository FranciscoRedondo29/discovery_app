"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Play, Pause, SkipForward, Settings, RefreshCw, Upload } from "lucide-react";
import { useHighlightPlayback } from "@/hooks/useHighlightPlayback";
import { useWordHighlight } from "@/hooks/useWordHighlight";
import { useSentenceAudio } from "@/hooks/useSentenceAudio";
import { useWordAudio } from "@/hooks/useWordAudio";
import { useAudioWordSplitter } from "@/hooks/useAudioWordSplitter";
import { WordWithAudio } from "@/components/practice/WordWithAudio";
import { PHRASES, getPhrasesByLevel } from "@/lib/phrases";
import type { Exercise, Phrase, WordTiming } from "@/types/exercises";

type Difficulty = "easy" | "medium" | "hard";

export default function LearningPage() {
  const router = useRouter();

  // State management
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
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
  const [showUploadMode, setShowUploadMode] = useState(false);

  // Audio hooks
  const sentenceAudio = useSentenceAudio();
  const wordAudio = useWordAudio();
  const audioSplitter = useAudioWordSplitter();
  
  // Highlight playback hook for syllables mode
  const highlight = useHighlightPlayback();
  
  // Word highlight hook for phrase mode
  const wordHighlight = useWordHighlight();

  // Detect when playback finishes to enable next button and mark as complete
  useEffect(() => {
    // If playback was started and now both are not playing, it means playback finished
    if (isPlaybackStarted && !highlight.isPlaying && !sentenceAudio.isPlaying) {
      setHasFinishedPlayback(true);
      setIsPlaybackStarted(false);
      // Mark current exercise as completed
      if (currentPhrase) {
        setCompletedExercises(prev => new Set(Array.from(prev).concat(currentPhrase.id)));
      }
    }
  }, [highlight.isPlaying, sentenceAudio.isPlaying, isPlaybackStarted, currentPhrase]);

  // Stop word audio when sentence playback starts
  useEffect(() => {
    if (sentenceAudio.isPlaying) {
      wordAudio.stopWord();
    }
  }, [sentenceAudio.isPlaying, wordAudio]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhrase]);

  // Load audio buffer when phrase changes
  useEffect(() => {
    if (currentPhrase?.audioFile) {
      sentenceAudio.loadAudio(currentPhrase.audioFile);
      // Carregar áudio no splitter para segmentação automática
      loadPhraseAudioForSegmentation(currentPhrase.audioFile);
    }
  }, [currentPhrase]);

  // Carregar áudio no audioSplitter para segmentação automática
  const loadPhraseAudioForSegmentation = async (audioUrl: string) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], audioUrl.split('/').pop() || 'audio.m4a', { type: blob.type });
      await audioSplitter.carregarAudio(file);
    } catch (err) {
      console.error('Erro ao carregar áudio para segmentação:', err);
    }
  };

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
          highlight.play(currentPhrase.syllables, playbackSpeed);
          setIsPlaybackStarted(true);
        }
      }
    } else {
      // Phrase mode: play sentence audio with word highlighting
      if (sentenceAudio.isPlaying) {
        sentenceAudio.pause();
        wordHighlight.pause();
      } else {
        // Converter audioSegments em WordTimings para o highlighting
        const words = currentText.split(/\s+/);
        const dynamicWordTimings: WordTiming[] = audioSplitter.audioSegments.map((segment, index) => ({
          word: words[index] || '',
          start: segment.start,
          end: segment.start + segment.duration
        }));

        if (sentenceAudio.audioBuffer && dynamicWordTimings.length > 0) {
          // Start sentence audio playback
          sentenceAudio.play(playbackSpeed);
          // Start word highlighting synchronized with audio using automatic timings
          wordHighlight.play(dynamicWordTimings, playbackSpeed);
          setIsPlaybackStarted(true);
        }
      }
    }
  };

  /**
   * Handle word click - play individual word audio using audioSplitter segments
   * Only enabled when sentence audio is not playing
   */
  const handleWordClick = async (word: string, index: number) => {
    if (!sentenceAudio.isPlaying && audioSplitter.audioSegments[index]) {
      try {
        audioSplitter.tocarSegmento(audioSplitter.audioSegments[index], index);
      } catch (err) {
        console.error('Error playing word audio:', err);
      }
    }
  };

  /**
   * Handle audio file upload
   */
  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await audioSplitter.carregarAudio(file);
    }
  };

  const handleToggleSyllables = () => {
    // Stop any playing audio/highlight when toggling
    highlight.pause();
    sentenceAudio.pause();
    wordHighlight.pause();
    wordAudio.stopWord();
    setShowSyllables(!showSyllables);
  };

  const handleNextSentence = () => {
    highlight.reset();
    sentenceAudio.pause();
    wordHighlight.reset();
    wordAudio.stopWord();
    setShowSyllables(false);
    setHasFinishedPlayback(false);
    setIsPlaybackStarted(false);
    loadNextPhrase();
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setShowSyllables(false);
    highlight.reset();
    sentenceAudio.pause();
    wordHighlight.reset();
    wordAudio.stopWord();
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


  return (
    <div className="min-h-screen bg-[#FEFCE8] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-800 hover:bg-gray-100 cursor-pointer"
            onClick={() => router.push('/aluno')}
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
            variant="outline"
            size="sm"
            onClick={() => setShowUploadMode(!showUploadMode)}
            className={`border-primary-yellow text-text-primary hover:bg-soft-yellow rounded-lg px-4 ${
              showUploadMode ? 'bg-primary-yellow' : ''
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {showUploadMode ? 'Ver Frases' : 'Upload Áudio'}
          </Button>
          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-primary-yellow text-text-primary hover:bg-soft-yellow rounded-lg px-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                Definições
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white shadow-lg rounded-lg p-4" align="end">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Definições</h3>
                
                {/* Playback Speed Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Velocidade de Leitura</label>
                    <span className="text-sm text-gray-600">{playbackSpeed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={(value) => setPlaybackSpeed(value[0])}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.5x</span>
                    <span>1.5x</span>
                  </div>
                </div>

                {/* Syllable Division Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Divisão Silábica</label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        (Em desenvolvimento)
                      </span>
                    </div>
                    <Switch
                      checked={showSyllables}
                      onCheckedChange={handleToggleSyllables}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Upload Mode Section */}
      {showUploadMode ? (
        <div className="px-6 py-6 mx-6">
          <Card className="border rounded-2xl shadow-sm bg-white">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload de Áudio para Segmentação</h2>
              
              {/* Upload Input */}
              <div className="mb-6">
                <label className="block mb-2">
                  <div className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-yellow transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer text-center">
                      <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Clica para selecionar ficheiro de áudio</p>
                      <p className="text-sm text-gray-400 mt-1">MP3, WAV, M4A, etc.</p>
                    </label>
                  </div>
                </label>

                {audioSplitter.audioFileName && (
                  <p className="text-sm text-gray-600 mt-2">Ficheiro: {audioSplitter.audioFileName}</p>
                )}

                {audioSplitter.segmentandoAudio && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-yellow mx-auto"></div>
                    <p className="text-gray-600 mt-2">A segmentar áudio...</p>
                  </div>
                )}

                {audioSplitter.segmentError && (
                  <p className="text-red-600 text-sm mt-2">{audioSplitter.segmentError}</p>
                )}
              </div>

              {/* Palavras Segmentadas */}
              {audioSplitter.palavras.length > 0 && audioSplitter.audioSegments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Palavras Encontradas ({audioSplitter.palavras.length})
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 p-6 bg-gray-50 rounded-lg min-h-[200px]">
                    {audioSplitter.palavras.map((palavra, index) => {
                      const segment = audioSplitter.audioSegments[index];
                      const isPlaying = audioSplitter.playbackInfo?.index === index;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => segment && audioSplitter.tocarSegmento(segment, index)}
                          disabled={!segment}
                          className={`
                            px-6 py-3 rounded-xl font-bold text-2xl transition-all duration-200
                            ${
                              isPlaying
                                ? 'bg-primary-yellow text-white scale-110 shadow-lg ring-2 ring-primary-yellow/50'
                                : segment
                                ? 'bg-white text-gray-800 hover:bg-gray-100 hover:scale-105 cursor-pointer shadow-sm'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                          `}
                          style={{ fontFamily: "'OpenDyslexic', sans-serif" }}
                        >
                          {palavra}
                          
                        </button>
                      );
                    })}
                  </div>

                  {audioSplitter.playbackInfo && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        A reproduzir: <strong>{audioSplitter.playbackInfo.palavra}</strong>
                      </p>
                    </div>
                  )}

                  {/* Controlo de Threshold */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Sensibilidade de Silêncio: {audioSplitter.silenceThreshold.toFixed(3)}
                    </label>
                    <Slider
                      value={[audioSplitter.silenceThreshold]}
                      onValueChange={(value) => audioSplitter.setSilenceThreshold(value[0])}
                      min={0.001}
                      max={0.1}
                      step={0.001}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Ajusta para melhorar a deteção de palavras (valor baixo = mais sensível)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
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
                sentenceAudio.pause();
                wordHighlight.reset();
                wordAudio.stopWord();
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
                sentenceAudio.pause();
                wordHighlight.reset();
                wordAudio.stopWord();
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
                    // Full phrase mode (words with highlighting and click-to-hear)
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 min-h-[150px] px-10">
                      {currentText.split(/\s+/).map((word, index) => {
                        const segment = audioSplitter.audioSegments[index];
                        const isPlayingWord = audioSplitter.playbackInfo?.index === index;
                        
                        return (
                          <button
                            key={`${index}-${word}`}
                            onClick={() => handleWordClick(word, index)}
                            disabled={!segment || sentenceAudio.isPlaying || sentenceAudio.isLoading}
                            className={`
                              text-4xl md:text-5xl font-bold transition-all duration-200 tracking-wider
                              ${
                                isPlayingWord
                                  ? 'text-white bg-primary-yellow px-4 py-2 rounded-xl scale-110 shadow-xl ring-2 ring-primary-yellow/50'
                                  : wordHighlight.isPlaying && wordHighlight.currentWordIndex === index
                                  ? 'text-white bg-primary-yellow px-4 py-2 rounded-xl scale-110 shadow-lg'
                                  : segment && !sentenceAudio.isPlaying
                                  ? 'text-gray-800 hover:scale-105 hover:opacity-80 cursor-pointer'
                                  : 'text-gray-800 cursor-default'
                              }
                            `}
                            style={{ fontFamily: "'OpenDyslexic', sans-serif" }}
                            role={segment ? "button" : undefined}
                            aria-label={segment ? `Ouvir palavra: ${word}` : undefined}
                            tabIndex={segment && !sentenceAudio.isPlaying ? 0 : -1}
                          >
                            {word}
                          </button>
                        );
                      })}
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
                disabled={isLoading || !currentPhrase || sentenceAudio.isLoading}
                className="bg-[#E5A534] text-gray-900 hover:bg-[#E5A534]/90 font-bold text-lg px-8 py-6 rounded-2xl shadow-sm min-w-[200px]"
              >
                {(showSyllables ? highlight.isPlaying : sentenceAudio.isPlaying) ? (
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
      </>
      )}
    </div>
  );
}
