import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyPT, DIFFICULTY_LABELS } from '@/types/exercises';

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyPT;
  onSelect: (diff: DifficultyPT) => void;
  disabled: boolean;
}

export function DifficultySelector({ selectedDifficulty, onSelect, disabled }: DifficultySelectorProps) {
  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Nível de Dificuldade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 flex-wrap">
          {(['facil', 'medio', 'dificil'] as DifficultyPT[]).map((diff) => (
            <Button
              key={diff}
              onClick={() => onSelect(diff)}
              disabled={disabled}
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
  );
}
