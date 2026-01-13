import { EvaluationMetrics, WordAnalysisResult, ErrorType } from './types';
import { WordAlignment } from './WordAlignment';
import { TextNormalization } from './TextNormalization';
import { LetterErrorAnalysis } from './LetterErrorAnalysis';
import { PunctuationAndCaseAnalysis } from './PunctuationAndCaseAnalysis';
import { Scoring } from './Scoring';

export class DictationEvaluator {
  
  static evaluate(correctText: string, studentText: string): EvaluationMetrics {
    const alignedWords = WordAlignment.align(correctText, studentText);
    const wordDetails: WordAnalysisResult[] = [];

    let totalLettersCorrect = 0;
    let totalLettersOmitted = 0;
    let totalLettersInserted = 0;
    let totalLettersSubstituted = 0;
    let totalLettersTransposed = 0;
    let totalPunctuationErrors = 0;
    let totalCapErrors = 0;
    let totalWordJoins = 0;
    let totalWordSplits = 0;
    let totalWordSubstitutions = 0;
    let omittedWords = 0;
    let extraWords = 0;
    let correctWords = 0;

    for (const pair of alignedWords) {
      if (!pair.correct && pair.student) {
        extraWords++;
        // Palavra extra sem referência, não analisamos letras detalhadamente, conta como erro de palavra
        wordDetails.push({
            originalWord: "",
            studentWord: pair.student,
            cleanOriginal: "",
            cleanStudent: TextNormalization.normalizeForComparison(pair.student),
            status: 'extra',
            letterErrors: [],
            errorTypes: ['extra_word'],
            punctuationError: 'none',
            caseError: 'none'
        });
        continue;
      }
      
      if (pair.correct && !pair.student) {
        omittedWords++;
        wordDetails.push({
            originalWord: pair.correct,
            studentWord: null,
            cleanOriginal: TextNormalization.normalizeForComparison(pair.correct),
            cleanStudent: "",
            status: 'missing',
            letterErrors: [], // Poderíamos listar todas as letras como omitidas aqui
            errorTypes: ['missing_word'],
            punctuationError: 'none',
            caseError: 'none'
        });
        continue;
      }

      if (pair.correct && pair.student) {
        const cleanCorrect = TextNormalization.normalizeForComparison(pair.correct);
        const cleanStudent = TextNormalization.normalizeForComparison(pair.student);
        
        let errorTypes: ErrorType[] = [];
        let letterAnalysis: import('./types').LetterDetail[] = [];
        let wordHasLetterError = false;

        // Se houver erro de SPLIT ou JOIN:
        // NÃO contabilizar erros de letras, nem omissões, nem substituições.
        // O único erro é o estrutural.
        if (pair.isJoin || pair.isSplit) {
            if (pair.isJoin) {
                errorTypes.push('merge_word_error');
                totalWordJoins++;
            }
            if (pair.isSplit) {
                errorTypes.push('split_word_error');
                totalWordSplits++;
            }
            // Não fazemos análise de letras aqui para não poluir
        } else {
            // Análise normal de letras
            letterAnalysis = LetterErrorAnalysis.analyzeWord(cleanCorrect, cleanStudent);
            
            // Contar erros de letra significativos (ignorando corretos)
            const significantLetterErrors = letterAnalysis.filter(l => l.type !== 'correct').length;

            if (significantLetterErrors > 2) {
                // REGRA DE SUBSTITUIÇÃO DE PALAVRA (> 2 erros)
                // Ignorar os erros de letra individuais
                // Marcar como substituição de palavra única
                errorTypes.push('substitution_word');
                totalWordSubstitutions++;
                wordHasLetterError = true;
                
                // Limpar análise de letras para não mostrar na UI nem contar scores duplos
                // Mas mantemos o objeto vazio ou marcado se quisermos debug, aqui limpamos
                letterAnalysis = []; 
            } else {
                // Contabilização normal de erros de letra
                letterAnalysis.forEach(l => {
                    if (l.type === 'omission_letter') totalLettersOmitted++;
                    if (l.type === 'insertion_letter') totalLettersInserted++;
                    if (l.type === 'substitution_letter') totalLettersSubstituted++;
                    if (l.type === 'transposition_letter') totalLettersTransposed += 0.5; // Conta 1 erro por par de letras trocadas
                    if (l.type === 'correct') totalLettersCorrect++;
                    
                    if (l.type !== 'correct') {
                        wordHasLetterError = true;
                        if (!errorTypes.includes(l.type)) errorTypes.push(l.type);
                    }
                });
            }
        }

        // Analisar Pontuação e Maiúsculas
        const { punct, caseErr } = PunctuationAndCaseAnalysis.analyze(pair.correct, pair.student);

        if (punct !== 'none') totalPunctuationErrors++;
        if (caseErr !== 'none') totalCapErrors++;

        let status: 'correct' | 'wrong' = 'correct';
        // Se houver erro de letra ou estrutura (Split/Join), a palavra conta como errada.
        // Erros APENAS de pontuação ou maiúsculas NÃO tornam a palavra "errada" para contagem de palavras corretas.
        if (wordHasLetterError || pair.isJoin || pair.isSplit) {
            status = 'wrong';
        } else {
            correctWords++;
        }

        wordDetails.push({
            originalWord: pair.correct,
            studentWord: pair.student,
            cleanOriginal: cleanCorrect,
            cleanStudent: cleanStudent,
            status,
            letterErrors: letterAnalysis,
            errorTypes,
            punctuationError: punct,
            caseError: caseErr
        });
      }
    }

    const metrics: EvaluationMetrics = {
        totalWords: alignedWords.filter(p => p.correct).length,
        correctWords,
        omittedWords,
        extraWords,
        totalLettersCorrect,
        totalLettersOmitted,
        totalLettersInserted,
        totalLettersSubstituted,
        totalLettersTransposed,
        totalPunctuationErrors,
        totalCapErrors,
        totalWordJoins,
        totalWordSplits,
        totalWordSubstitutions,
        wordDetails,
        accuracyPercentage: 0 // Will be calculated next
    };

    metrics.accuracyPercentage = Scoring.calculate(metrics);

    return metrics;
  }
}
