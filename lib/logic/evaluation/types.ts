export type ErrorType = 
  | 'correct'
  | 'omission_letter'
  | 'insertion_letter'
  | 'substitution_letter'
  | 'transposition_letter'
  | 'split_word_error' // Ex: "em cima" -> "emcima"
  | 'merge_word_error' // Ex: "a casa" -> "acasa" (sinalizado na palavra composta)
  | 'substitution_word' // Nova categoria: palavra totalmente diferente
  | 'missing_word'
  | 'extra_word';

export type PunctuationError = 'missing' | 'inserted' | 'wrong_symbol' | 'none';
export type CaseError = 'missing_cap' | 'wrong_cap' | 'none';

export interface LetterDetail {
  index: number;
  charCorrect: string | null;
  charStudent: string | null;
  type: ErrorType;
}

export interface WordAnalysisResult {
  originalWord: string;
  studentWord: string | null; // Null se a palavra foi omitida completamente
  cleanOriginal: string;
  cleanStudent: string;
  status: 'correct' | 'wrong' | 'missing' | 'extra';
  
  // Métricas detalhadas
  letterErrors: LetterDetail[];
  errorTypes: ErrorType[];
  
  // Pontuação e Maiúsculas
  punctuationError: PunctuationError;
  caseError: CaseError;
}

export interface EvaluationMetrics {
  // Contagens Absolutas
  totalWords: number;
  correctWords: number;
  omittedWords: number;
  extraWords: number;
  
  totalLettersCorrect: number;
  totalLettersOmitted: number;
  totalLettersInserted: number;
  totalLettersSubstituted: number;
  totalLettersTransposed: number;
  
  totalPunctuationErrors: number;
  totalCapErrors: number;
  
  // Indicadores Especiais
  totalWordJoins: number;  // "a casa" -> "acasa"
  totalWordSplits: number; // "emcima" -> "em cima"
  totalWordSubstitutions: number; // Palavras totalmente diferentes

  // Score Final
  accuracyPercentage: number; // 0 a 100

  // Detalhe para UI
  wordDetails: WordAnalysisResult[];
}
