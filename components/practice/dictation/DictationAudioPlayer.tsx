import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Pause, Play, Loader2 } from 'lucide-react';
import type { Exercise } from '@/types/exercises';

interface AudioPlayerProps {
  currentExercise: Exercise | null;
  isLoading: boolean;
  status: 'listening' | 'evaluating' | 'completed';
  isPlaying: boolean;
  onPlayPause: () => void;
  audioError: string | null;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function DictationAudioPlayer({
  currentExercise,
  isLoading,
  status,
  isPlaying,
  onPlayPause,
  audioError,
  playbackSpeed,
  onSpeedChange,
}: AudioPlayerProps) {
  
  return (
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
          onClick={onPlayPause}
          disabled={isLoading || !currentExercise || status === 'completed'}
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
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-yellow"
            disabled={status === 'completed'}
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
  );
}
