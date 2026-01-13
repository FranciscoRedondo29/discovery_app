import { TextNormalization } from './TextNormalization';

export interface AlignedPair {
  correct: string;
  student: string | null;
  isJoin?: boolean; // Se true, "correct" contém duas palavras originais unidas
  isSplit?: boolean; // Se true, "student" foi forçado a unir
}

type Move = 'MATCH' | 'INSERT' | 'DELETE' | 'JOIN' | 'SPLIT';

export class WordAlignment {

  static align(correctText: string, studentText: string): AlignedPair[] {
    // 1. Prepare data
    const rawCorrect = correctText.trim().split(/\s+/).filter(w => w.length > 0);
    const rawStudent = studentText.trim().split(/\s+/).filter(w => w.length > 0);
    
    // If empty inputs
    if (rawCorrect.length === 0 && rawStudent.length === 0) return [];
    if (rawCorrect.length === 0) return rawStudent.map(s => ({ correct: "", student: s }));
    if (rawStudent.length === 0) return rawCorrect.map(c => ({ correct: c, student: null }));

    const cleanCorrect = rawCorrect.map(w => TextNormalization.normalizeForComparison(w));
    const cleanStudent = rawStudent.map(w => TextNormalization.normalizeForComparison(w));

    const M = cleanCorrect.length;
    const N = cleanStudent.length;

    // 2. Initialize DP tables
    // cost[i][j] = min cost to align correct[0..i] with student[0..j]
    const cost: number[][] = Array.from({ length: M + 1 }, () => Array(N + 1).fill(Infinity));
    const move: Move[][] = Array.from({ length: M + 1 }, () => Array(N + 1).fill('MATCH' as Move));

    cost[0][0] = 0;

    // Initialize borders
    for (let i = 1; i <= M; i++) {
        cost[i][0] = cost[i-1][0] + 1; // All deletions
        move[i][0] = 'DELETE';
    }
    for (let j = 1; j <= N; j++) {
        cost[0][j] = cost[0][j-1] + 1; // All insertions
        move[0][j] = 'INSERT';
    }

    // 3. Fill DP
    for (let i = 1; i <= M; i++) {
        for (let j = 1; j <= N; j++) {
            const cWord = cleanCorrect[i-1];
            const sWord = cleanStudent[j-1];

            // A. MATCH / SUBSTITUTION
            const dist = this.getWordDistance(cWord, sWord);
            // Dynamic substitution cost: 
            // 0 = exact match
            // 0 < x < 1 = typo (e.g. 0.4)
            // 1 = complete mismatch
            const subCost = dist === 0 ? 0 : (dist <= 2 || (cWord.length > 3 && dist <= 3) ? 0.6 : 1.2); 
            // Note: 1.2 for complete mismatch makes it prefer Insert+Delete (Cost 2) only if heavily mismatched?
            // Actually: Delete+Insert cost = 1+1=2. 
            // If subCost is 1.2, algorithm prefers substitution over Del/Ins. 
            // BUT, if we have "WordA WordB" vs "WordB",
            // i=0(A), j=0(B). Cost sub=1.2.
            // i=1(B), j=0(B). Del A (Cost 1) -> Match B (Cost 0). Total 1.
            // So algorithm works. 1.2 ensures we prefer alignment if it helps future matches.

            let bestCost = cost[i-1][j-1] + subCost;
            let bestMove: Move = 'MATCH';

            // B. DELETE (Missing correct word)
            if (cost[i-1][j] + 1 < bestCost) {
                bestCost = cost[i-1][j] + 1;
                bestMove = 'DELETE';
            }

            // C. INSERT (Extra student word)
            if (cost[i][j-1] + 1 < bestCost) {
                bestCost = cost[i][j-1] + 1;
                bestMove = 'INSERT';
            }

            // D. JOIN (2 Correct -> 1 Student) E.g. "a" + "prender" -> "aprender"
            if (i >= 2) {
                const combined = cleanCorrect[i-2] + cleanCorrect[i-1]; // Simple concatenation
                if (combined === sWord) {
                     // Strong Bonus for structural match
                    if (cost[i-2][j-1] < bestCost) {
                        bestCost = cost[i-2][j-1]; 
                        bestMove = 'JOIN';
                    }
                }
            }

            // E. SPLIT (1 Correct -> 2 Student) E.g. "embaixo" -> "em" + "baixo"
            if (j >= 2) {
                const combined = cleanStudent[j-2] + cleanStudent[j-1];
                if (combined === cWord) {
                    if (cost[i-1][j-2] < bestCost) {
                        bestCost = cost[i-1][j-2];
                        bestMove = 'SPLIT';
                    }
                }
            }

            cost[i][j] = bestCost;
            move[i][j] = bestMove;
        }
    }

    // 4. Backtrack
    let i = M;
    let j = N;
    const aligned: AlignedPair[] = [];

    while (i > 0 || j > 0) {
        if (i === 0) {
            // Only insertions left
            aligned.unshift({ correct: "", student: rawStudent[j-1] });
            j--;
            continue;
        }
        if (j === 0) {
            // Only deletions left
            aligned.unshift({ correct: rawCorrect[i-1], student: null });
            i--;
            continue;
        }

        const op = move[i][j];

        if (op === 'MATCH') {
            aligned.unshift({ correct: rawCorrect[i-1], student: rawStudent[j-1] });
            i--; j--;
        } else if (op === 'DELETE') {
            aligned.unshift({ correct: rawCorrect[i-1], student: null });
            i--;
        } else if (op === 'INSERT') {
            aligned.unshift({ correct: "", student: rawStudent[j-1] });
            j--;
        } else if (op === 'JOIN') {
            // 2 correct words match 1 student word
            aligned.unshift({ 
                correct: rawCorrect[i-2] + " " + rawCorrect[i-1], 
                student: rawStudent[j-1],
                isJoin: true
            });
            i -= 2; j--;
        } else if (op === 'SPLIT') {
            // 1 correct match 2 student words
            aligned.unshift({
                correct: rawCorrect[i-1],
                student: rawStudent[j-2] + " " + rawStudent[j-1],
                isSplit: true
            });
            i--; j -= 2;
        }
    }

    return aligned;
  }

  // Simple Levenshtein for word similarity
  private static getWordDistance(s1: string, s2: string): number {
    if (s1 === s2) return 0;
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;

    const row = Array(s2.length + 1).fill(0).map((_, i) => i);
    for (let i = 0; i < s1.length; i++) {
        row[0] = i + 1;
        let prev = i; // value of dp[i][j-1] from previous row (diagonal)
        for (let j = 0; j < s2.length; j++) {
            const val = row[j+1]; // basically dp[i][j] before update
            const cost = s1[i] === s2[j] ? 0 : 1;
            row[j+1] = Math.min(
                row[j] + 1,       // insert
                row[j+1] + 1,     // delete
                prev + cost       // sub
            );
            prev = val;
        }
    }
    return row[s2.length];
  }
}
