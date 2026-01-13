import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailedFeedback } from '@/components/practice/DetailedFeedback';
import { EvaluationMetrics } from '@/lib/logic/evaluation/types';

interface DictationResultsViewProps {
    metrics: EvaluationMetrics;
}

export function DictationResultsView({ metrics }: DictationResultsViewProps) {
    return (
        <Card className="border-2 border-primary-yellow/30 bg-white">
            <CardHeader>
                <CardTitle className="text-lg">Resultado da Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
                <DetailedFeedback metrics={metrics} />

                {/* Explanation text */}
                <div className="mt-6 text-sm text-text-primary/70 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium mb-2">Legenda:</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span> Palavras Corretas</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span> Palavras com Erro</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded-full inline-block"></span> Palavras em Falta</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded-full inline-block"></span> Palavras Extra</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}