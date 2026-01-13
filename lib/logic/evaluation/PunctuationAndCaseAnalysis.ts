import { PunctuationError, CaseError } from './types';
import { TextNormalization } from './TextNormalization';

export class PunctuationAndCaseAnalysis {
  
  static analyze(original: string, student: string): { punct: PunctuationError, caseErr: CaseError } {
    if (!original || !student) return { punct: 'none', caseErr: 'none' };

    let punct: PunctuationError = 'none';
    let caseErr: CaseError = 'none';

    // 1. Análise de Maiúsculas (simples: verifica primeira letra)
    // Se a original começa com maiúscula e o aluno com minúscula
    const firstOrig = original.charAt(0);
    const firstStud = student.charAt(0);

    if (TextNormalization.isLetter(firstOrig) && TextNormalization.isLetter(firstStud)) {
        const isOrigUpper = firstOrig === firstOrig.toUpperCase() && firstOrig !== firstOrig.toLowerCase();
        const isStudUpper = firstStud === firstStud.toUpperCase() && firstStud !== firstStud.toLowerCase();

        if (isOrigUpper && !isStudUpper) {
            caseErr = 'missing_cap';
        } else if (!isOrigUpper && isStudUpper) {
            caseErr = 'wrong_cap';
        }
    }

    // 2. Análise de Pontuação (verifica último caractere se for pontuação)
    const lastOrig = original.slice(-1);
    const lastStud = student.slice(-1);
    const origEndsWithPunct = !TextNormalization.isLetter(lastOrig);
    const studEndsWithPunct = !TextNormalization.isLetter(lastStud);

    if (origEndsWithPunct) {
        if (!studEndsWithPunct) {
            punct = 'missing';
        } else if (lastOrig !== lastStud) {
            punct = 'wrong_symbol';
        }
    } else if (studEndsWithPunct) {
        punct = 'inserted';
    }

    // TODO: Adicionar análise de pontuação interna se necessário (vírgulas)

    return { punct, caseErr };
  }
}
