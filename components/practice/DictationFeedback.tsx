import React from 'react';

interface DiffToken {
  value: string;
  type: 'correct' | 'added' | 'missing';
}

interface DictationFeedbackProps {
  tokens: DiffToken[];
  className?: string;
}

export function DictationFeedback({ tokens, className = '' }: DictationFeedbackProps) {
  if (tokens.length === 0) {
    return (
      <div className={`text-center text-text-primary/60 py-8 ${className}`}>
        Nenhum feedback disponível
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Análise Detalhada:
      </h3>
      
      <div 
        className="text-2xl leading-relaxed space-x-2 md:space-x-3"
        style={{ fontFamily: "OpenDyslexic, Arial, sans-serif" }}
      >
        {tokens.map((token, index) => {
          if (token.type === 'correct') {
            return (
              <span
                key={index}
                className="inline-block text-gray-900 mr-2 md:mr-3"
                title="Palavra correta"
              >
                {token.value}
              </span>
            );
          } else if (token.type === 'added') {
            return (
              <span
                key={index}
                className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded-md line-through font-medium"
                title="Palavra errada ou extra"
              >
                {token.value}
              </span>
            );
          } else if (token.type === 'missing') {
            return (
              <span
                key={index}
                className="inline-block text-green-600 font-semibold px-2 py-1 rounded-md"
                title="Palavra em falta - deveria estar aqui"
              >
                {token.value}
              </span>
            );
          }
          return null;
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-900 rounded"></div>
          <span className="text-text-primary/70">Correto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-text-primary/70">Erro (escreveste isto)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-text-primary/70">Em falta (deveria ser isto)</span>
        </div>
      </div>
    </div>
  );
}
