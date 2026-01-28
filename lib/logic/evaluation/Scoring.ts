import { EvaluationMetrics, WordAnalysisResult } from './types';

export class Scoring {
  
  /**
   * Arredonda um número a N casas decimais.
   */
  private static roundTo(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Limita um valor entre min e max.
   */
  private static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Calcula a penalização para uma palavra individual.
   * Retorna um valor entre 0 e n (máximo por palavra).
   */
  private static calculateWordPenalty(word: WordAnalysisResult, n: number): number {
    // Palavra em falta ou extra são tratadas separadamente
    if (word.status === 'missing' || word.status === 'extra') {
      return 0; // Já contabilizado em omittedWords/extraWords
    }

    let penalty = 0;
    const wordLength = word.cleanOriginal.length;
    const isShortWord = wordLength <= 3;

    // Verificar se é uma substituição de palavra completa
    const isWordSubstitution = word.errorTypes.includes('substitution_word');
    
    if (isWordSubstitution) {
      // Palavra errada: perde n%
      penalty = n;
    } else {
      // Erro de maiúscula: -0.1 * n
      if (word.caseError !== 'none') {
        penalty += 0.1 * n;
      }

      // Contar erros de letra (transposição, inserção, omissão, substituição)
      const letterErrorCount = word.letterErrors.filter(
        l => l.type === 'transposition_letter' ||
             l.type === 'insertion_letter' ||
             l.type === 'omission_letter' ||
             l.type === 'substitution_letter'
      ).length;

      // Erros de junção/separação
      const hasJoinError = word.errorTypes.includes('merge_word_error');
      const hasSplitError = word.errorTypes.includes('split_word_error');
      const structuralErrors = (hasJoinError ? 1 : 0) + (hasSplitError ? 1 : 0);

      const totalLetterErrors = letterErrorCount + structuralErrors;

      // Penalização por erro: 0.4*n (ou n se palavra curta ≤3 letras)
      const errorPenaltyRate = isShortWord ? n : 0.4 * n;
      penalty += totalLetterErrors * errorPenaltyRate;
    }

    // Limite por palavra: máximo n%
    return Math.min(penalty, n);
  }

  /**
   * Calcula a pontuação final (0-100%) baseada nas métricas de avaliação.
   * 
   * Regras:
   * 1. Conta nº de palavras da frase correta (c)
   * 2. n = 95 / c (arredondado a 3 casas decimais)
   * 3. Score inicial = 100%
   * 4. Erro de pontuação: -5%
   * 5. Por palavra:
   *    - Erro maiúscula: -0.1*n
   *    - Erro letra (transposição/inserção/omissão/substituição/junção/separação): 
   *      -0.4*n (ou -n se palavra ≤3 letras)
   *    - Palavra errada (substituição completa): -n
   *    - Máximo por palavra: n
   * 6. Palavra a mais ou em falta: -n
   * 7. Clamp [0, 100] e arredonda às unidades
   */
  static calculate(metrics: EvaluationMetrics): number {
    // 1. Número de palavras da frase correta
    const wordCount = metrics.totalWords;
    if (wordCount === 0) return 0;

    // 2. Calcular n = 95 / count, arredondado a 3 casas decimais
    const n = this.roundTo(95 / wordCount, 3);

    // 3. Score inicial = 100%
    let score = 100;

    // 4. Por cada erro de pontuação, subtrai 5%
    score -= metrics.totalPunctuationErrors * 5;

    // 5. Por cada palavra, calcular penalização (máximo n por palavra)
    for (const word of metrics.wordDetails) {
      score -= this.calculateWordPenalty(word, n);
    }

    // 6. Palavras a mais ou em falta: -n cada
    score -= metrics.omittedWords * n;
    score -= metrics.extraWords * n;

    // 7. Clamp [0, 100] e arredondar às unidades
    score = this.clamp(score, 0, 100);
    
    return Math.round(score);
  }
}
