import { ErrorType, LetterDetail } from './types';

export class LetterErrorAnalysis {
  
  /**
   * Compara duas palavras e retorna os detalhes letra a letra.
   * Deteta: Correto, Substituição, Inserção, Omissão, Transposição.
   */
  static analyzeWord(correct: string, student: string): LetterDetail[] {
    const m = correct.length;
    const n = student.length;
    
    // Matriz de distância dp[i][j]
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Inicialização base
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = correct[i - 1] === student[j - 1] ? 0 : 1;
        
        // Operações básicas
        let min = Math.min(
          dp[i - 1][j] + 1,     // Omissão (deletar do correto)
          dp[i][j - 1] + 1,     // Inserção (inserir no aluno)
          dp[i - 1][j - 1] + cost // Substituição ou Match
        );

        // Verificação de Transposição (Damerau-Levenshtein simplificado)
        if (i > 1 && j > 1 && 
            correct[i - 1] === student[j - 2] && 
            correct[i - 2] === student[j - 1]) {
           min = Math.min(min, dp[i - 2][j - 2] + 1); // Custo 1 para transposição simples
        }

        dp[i][j] = min;
      }
    }

    // Backtracking para identificar os erros
    const details: LetterDetail[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      
      // Transposição
      if (i > 1 && j > 1 && 
          correct[i - 1] === student[j - 2] && 
          correct[i - 2] === student[j - 1] &&
          correct[i - 1] !== student[j - 1] &&
          dp[i][j] === dp[i - 2][j - 2] + 1) {
            
        details.unshift({ index: i-1, charCorrect: correct[i-1], charStudent: student[j-2], type: 'transposition_letter' });
        details.unshift({ index: i-2, charCorrect: correct[i-2], charStudent: student[j-1], type: 'transposition_letter' });
        i -= 2;
        j -= 2;
        continue;
      }

      // Match ou Substituição
      // Verifica se o caminho veio da diagonal
      if (i > 0 && j > 0 && 
          (dp[i][j] === dp[i - 1][j - 1] + (correct[i - 1] === student[j - 1] ? 0 : 1))) {
        
        const type = correct[i - 1] === student[j - 1] ? 'correct' : 'substitution_letter';
        details.unshift({ index: i-1, charCorrect: correct[i-1], charStudent: student[j-1], type });
        i--;
        j--;
      } 
      // Omissão (estava no correto, mas não no aluno) - veio de cima
      else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        details.unshift({ index: i-1, charCorrect: correct[i-1], charStudent: null, type: 'omission_letter' });
        i--;
      } 
      // Inserção (não estava no correto, apareceu no aluno) - veio da esquerda
      else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
        details.unshift({ index: -1, charCorrect: null, charStudent: student[j-1], type: 'insertion_letter' });
        j--;
      }
    }

    return details;
  }
}
