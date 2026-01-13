import React from 'react';
import { EvaluationMetrics, WordAnalysisResult } from '@/lib/logic/evaluation/types';

interface DetailedFeedbackProps {
  metrics: EvaluationMetrics;
}

export function DetailedFeedback({ metrics }: DetailedFeedbackProps) {
  return (
    <div className="mt-8 space-y-6">
      {/* 1. Percentagem Global */}
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className={`text-6xl font-black mb-2 ${
            metrics.accuracyPercentage >= 90 ? 'text-green-600' :
            metrics.accuracyPercentage >= 70 ? 'text-yellow-600' : 
            'text-orange-600'
        }`}>
            {metrics.accuracyPercentage}%
        </div>
        <p className="text-gray-500 font-medium uppercase tracking-wide text-sm">Precisão Global</p>
      </div>

      {/* 2. Visualização palavra a palavra */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Análise Palavra a Palavra</h3>
        <div className="flex flex-wrap gap-4">
            {metrics.wordDetails.map((word, idx) => (
                <WordCard key={idx} word={word} />
            ))}
        </div>
      </div>
      
      {/* 3. Tabela de Métricas Detalhadas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           <MetricCard label="Palavras Corretas" value={metrics.correctWords} color="bg-green-50 text-green-700" />
           <MetricCard label="Transposições" value={metrics.totalLettersTransposed} />
           <div className="flex flex-col gap-1">
             <MetricCard label="Erros de Letra" value={metrics.totalLettersSubstituted + metrics.totalLettersInserted + metrics.totalLettersOmitted} />
             <span className="text-[10px] text-gray-400 text-center">inserção / omissão / substituição</span>
           </div>
           <MetricCard label="Junção/Separação" value={metrics.totalWordJoins + metrics.totalWordSplits} />
           <MetricCard label="Pontuação/Maiúsc." value={metrics.totalPunctuationErrors + metrics.totalCapErrors} />
      </div>
    </div>
  );
}

function WordCard({ word }: { word: WordAnalysisResult }) {
    const isCorrect = word.status === 'correct';
    const isMissing = word.status === 'missing';
    const isExtra = word.status === 'extra';
    const hasError = word.status === 'wrong';

    let borderClass = 'border-gray-200';
    let bgClass = 'bg-white';
    let textClass = 'text-gray-800';

    if (isCorrect) {
        borderClass = 'border-green-200';
        bgClass = 'bg-green-50';
        textClass = 'text-green-700';
    } else if (hasError) {
        // Erro: Agora com destaque visual na palavra original
        borderClass = 'border-red-200';
        bgClass = 'bg-red-50';
        textClass = 'text-red-700 line-through decoration-red-300 decoration-2 opacity-70 text-sm'; // Palavra do aluno fica "rasurada" ou menor
    } else if (isMissing) {
         borderClass = 'border-orange-200 border-dashed';
         bgClass = 'bg-orange-50';
         textClass = 'text-orange-700';
    } else if (isExtra) {
        // Extra: Agora laranja igual a Missing
        borderClass = 'border-orange-200';
        bgClass = 'bg-orange-50';
        textClass = 'text-orange-700 line-through decoration-2';
    }

    const showBlueOriginal = hasError || isMissing;

    // Detectar pontuação em falta
    const missingPunct = (word.punctuationError === 'missing' && word.originalWord) 
        ? word.originalWord.slice(-1).match(/[.,!?;:]/) ? word.originalWord.slice(-1) : '' 
        : '';

    return (
        <div className={`p-3 rounded-lg border ${borderClass} ${bgClass} flex flex-col min-w-[80px]`}>
            {/* Palavra Alvo (apenas se houver erro ou for missing) */}
            {!isExtra && !isCorrect && (
                <div className={`mb-1 font-bold ${showBlueOriginal ? 'text-xl text-blue-600' : 'text-xs text-gray-500 font-mono'}`}>
                    {word.originalWord}
                </div>
            )}
            
            {/* O que o aluno escreveu */}
            <div className={`font-bold leading-none ${textClass} ${hasError ? 'mt-1' : 'text-lg'}`}>
                {isMissing ? "(falta)" : (
                    <>
                        {word.studentWord || "---"}
                        {missingPunct && <span className="text-red-500 ml-[1px]">{missingPunct}</span>}
                    </>
                )}
            </div>
            
            {/* Tags de Erro */}
            {word.errorTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {word.errorTypes.map(e => (
                        <span key={e} className="text-[10px] px-1.5 py-0.5 bg-white border border-gray-100 rounded text-red-500 font-medium whitespace-nowrap shadow-sm">
                            {formatErrorType(e)}
                        </span>
                    ))}
                </div>
            )}

            {/* Erros Pontuação/Caps */}
            {(word.punctuationError !== 'none' || word.caseError !== 'none') && (
                <div className="flex flex-wrap gap-1 mt-1">
                     {word.caseError !== 'none' && (
                        <span className="text-[10px] text-blue-600 font-bold">Aa</span>
                     )}
                     {word.punctuationError !== 'none' && (
                        <span className="text-[10px] text-red-500 font-bold">.,?!</span>
                     )}
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, color = "bg-white text-gray-800" }: { label: string, value: number, color?: string }) {
    return (
        <div className={`${color} p-4 rounded-xl border border-gray-100 text-center shadow-sm`}>
            <div className="text-3xl font-black mb-1">{value}</div>
            <div className="text-xs uppercase font-semibold opacity-70">{label}</div>
        </div>
    )
}

function formatErrorType(type: string) {
    switch (type) {
        case 'omission_letter': return '-letra';
        case 'insertion_letter': return '+letra';
        case 'substitution_letter': return 'letra errada';
        case 'transposition_letter': return 'troca';
        case 'split_word_error': return 'separação indevida de palavra';
        case 'merge_word_error': return 'junção indevida de palavra';
        case 'substitution_word': return 'substituição da palavra correta';
        case 'missing_word': return 'palavra em falta';
        case 'extra_word': return 'palavra a mais';
        default: return type;
    }
}
