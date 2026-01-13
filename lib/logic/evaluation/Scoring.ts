import { EvaluationMetrics } from './types';

export class Scoring {
  // Pesos de penalidade (0 a 1)
  private static WEIGHTS = {
    LETTER_ERROR: 1.0,      // Omissão, Inserção, Substituição
    TRANSPOSITION: 0.8,     // Transposição é um erro "melhor" que substituição aleatória
    WORD_STRUCT: 1.0,       // Palavra extra, palavra em falta, split/join indevido
    PUNCTUATION: 0.25,      // Peso reduzido
    CAPITALIZATION: 0.25    // Peso reduzido
  };

  static calculate(metrics: EvaluationMetrics): number {
    // 1. Calcular o "Total de Unidades de Valor" (O tamanho do desafio)
    // Cada letra da string original vale 1 ponto.
    // Simplificação robusta: O denominador é baseado no número de caracteres "limpos" originais.
    
    // Total de "pontos de esforço" esperados:
    const totalLettersPotential = metrics.wordDetails.reduce((acc, word) => acc + word.cleanOriginal.length, 0);

    // Se o texto for vazio, retorna 100 ou 0
    if (totalLettersPotential === 0) return 0;

    // 2. Calcular Penalidades Ponderadas
    let penalty = 0;

    penalty += metrics.totalLettersOmitted * this.WEIGHTS.LETTER_ERROR;
    penalty += metrics.totalLettersInserted * this.WEIGHTS.LETTER_ERROR;
    penalty += metrics.totalLettersSubstituted * this.WEIGHTS.LETTER_ERROR;
    penalty += metrics.totalLettersTransposed * this.WEIGHTS.TRANSPOSITION;
    
    // Penalize missing complete words heavily (based on average word length e.g., 5 or fixed)
    // Here we use a fixed penalty per word roughly equivalent to missing a short word
    penalty += metrics.omittedWords * 4; 
    penalty += metrics.extraWords * 4; 
    
    // Penalize full word substitutions heavily (e.g. same as missing word)
    penalty += metrics.totalWordSubstitutions * 4;

    penalty += metrics.totalWordJoins * this.WEIGHTS.WORD_STRUCT;
    penalty += metrics.totalWordSplits * this.WEIGHTS.WORD_STRUCT;

    penalty += metrics.totalPunctuationErrors * this.WEIGHTS.PUNCTUATION;
    penalty += metrics.totalCapErrors * this.WEIGHTS.CAPITALIZATION;

    // 3. Cálculo da Percentagem
    // Accuracy = max(0, (TotalPotential - Penalty) / TotalPotential)
    
    // Nota: Em ditados muito curtos, erros de palavra podem gerar score negativo, então usamos max(0).
    // Penalidades podem exceder o tamanho do texto (se a criança escrever muito lixo).
    
    const rawScore = totalLettersPotential - penalty;
    const percentage = (rawScore / totalLettersPotential) * 100;

    return Math.max(0, Math.min(100, Math.round(percentage)));
  }
}
