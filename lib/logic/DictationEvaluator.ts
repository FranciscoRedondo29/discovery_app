/**
 * DictationEvaluator - Evaluates student dictation against original text
 * Uses word-level comparison with Levenshtein distance
 */

interface ErrorDetail {
  type: 'insertion' | 'omission' | 'substitution';
  word: string;
  index: number;
}

interface DiffItem {
  value: string;
  type: 'correct' | 'substitution' | 'omission' | 'insertion';
  expected?: string; // For substitutions and omissions
}

export interface DictationResult {
  accuracyPercentage: number;
  correctWords: number;
  totalWords: number;
  substitutionErrors: number;
  omissionErrors: number;
  insertionErrors: number;
  diff: DiffItem[];
}

export class DictationEvaluator {
  /**
   * Normalize text: lowercase and remove punctuation
   */
  private static normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-záàâãéêíóôõúüç\s]/gi, '') // Remove all punctuation, keep Portuguese letters and spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }

  /**
   * Split text into words
   */
  private static tokenize(text: string): string[] {
    const normalized = this.normalize(text);
    return normalized ? normalized.split(' ') : [];
  }

  /**
   * Calculate Levenshtein distance matrix for word sequences
   * Returns the edit operations needed to transform source into target
   */
  private static computeEditDistance(
    source: string[],
    target: string[]
  ): { distance: number; operations: Array<{ type: string; sourceIndex: number; targetIndex: number }> } {
    const m = source.length;
    const n = target.length;

    // Create DP table
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (source[i - 1] === target[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1]; // Match
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,     // Deletion (omission)
            dp[i][j - 1] + 1,     // Insertion
            dp[i - 1][j - 1] + 1  // Substitution
          );
        }
      }
    }

    // Backtrack to find operations
    const operations: Array<{ type: string; sourceIndex: number; targetIndex: number }> = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && source[i - 1] === target[j - 1]) {
        // Match - no operation
        i--;
        j--;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        // Substitution
        operations.unshift({ type: 'substitution', sourceIndex: i - 1, targetIndex: j - 1 });
        i--;
        j--;
      } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
        // Insertion
        operations.unshift({ type: 'insertion', sourceIndex: i, targetIndex: j - 1 });
        j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        // Deletion (omission)
        operations.unshift({ type: 'omission', sourceIndex: i - 1, targetIndex: j });
        i--;
      } else {
        // Fallback (shouldn't reach here)
        break;
      }
    }

    return { distance: dp[m][n], operations };
  }

  /**
   * Main evaluation method
   * @param original - The correct text
   * @param userInput - The student's dictation
   * @returns Evaluation result with score, errors, and diff
   */
  static evaluate(original: string, userInput: string): DictationResult {
    // Tokenize both texts
    const originalWords = this.tokenize(original);
    const userWords = this.tokenize(userInput);

    // Handle empty inputs
    if (originalWords.length === 0) {
      return {
        accuracyPercentage: userWords.length === 0 ? 100 : 0,
        correctWords: 0,
        totalWords: 0,
        substitutionErrors: 0,
        omissionErrors: 0,
        insertionErrors: 0,
        diff: [],
      };
    }

    // Compute edit distance and operations
    const { distance, operations } = this.computeEditDistance(originalWords, userWords);

    // Calculate score (Word Error Rate -> Accuracy)
    // WER = (substitutions + deletions + insertions) / total_words_in_reference
    // Accuracy = 100 - (WER * 100)
    const wer = distance / originalWords.length;
    const accuracyPercentage = Math.max(0, Math.round((1 - wer) * 100));

    // Count errors by type
    let substitutionErrors = 0;
    let omissionErrors = 0;
    let insertionErrors = 0;
    
    for (const op of operations) {
      if (op.type === 'substitution') {
        substitutionErrors++;
      } else if (op.type === 'omission') {
        omissionErrors++;
      } else if (op.type === 'insertion') {
        insertionErrors++;
      }
    }

    const correctWords = originalWords.length - substitutionErrors - omissionErrors;

    // Build diff for visual rendering
    const diff = this.buildDiff(originalWords, userWords, operations);

    return { 
      accuracyPercentage, 
      correctWords,
      totalWords: originalWords.length,
      substitutionErrors,
      omissionErrors,
      insertionErrors,
      diff 
    };
  }

  /**
   * Build diff array for visual comparison
   */
  private static buildDiff(
    originalWords: string[],
    userWords: string[],
    operations: Array<{ type: string; sourceIndex: number; targetIndex: number }>
  ): DiffItem[] {
    const diff: DiffItem[] = [];
    const usedSourceIndices = new Set<number>();
    const usedTargetIndices = new Set<number>();

    // Mark which indices are involved in operations
    const operationMap = new Map<number, { type: string; targetIndex?: number }>();
    for (const op of operations) {
      if (op.type === 'omission') {
        operationMap.set(op.sourceIndex, { type: 'omission' });
        usedSourceIndices.add(op.sourceIndex);
      } else if (op.type === 'insertion') {
        usedTargetIndices.add(op.targetIndex);
      } else if (op.type === 'substitution') {
        operationMap.set(op.sourceIndex, { type: 'substitution', targetIndex: op.targetIndex });
        usedSourceIndices.add(op.sourceIndex);
        usedTargetIndices.add(op.targetIndex);
      }
    }

    // Build diff by walking through original words
    let targetIndex = 0;
    for (let i = 0; i < originalWords.length; i++) {
      const op = operationMap.get(i);

      if (!op) {
        // No operation - this word matches
        diff.push({
          value: originalWords[i],
          type: 'correct',
        });
        targetIndex++;
      } else if (op.type === 'omission') {
        // Word was omitted
        diff.push({
          value: originalWords[i],
          type: 'omission',
          expected: originalWords[i],
        });
      } else if (op.type === 'substitution') {
        // Word was substituted
        diff.push({
          value: userWords[op.targetIndex!],
          type: 'substitution',
          expected: originalWords[i],
        });
        targetIndex++;
      }

      // Handle insertions that occur after this position
      while (targetIndex < userWords.length && usedTargetIndices.has(targetIndex)) {
        // Check if this is an insertion (not part of substitution)
        const isSubstitution = Array.from(operationMap.values()).some(
          (v) => v.type === 'substitution' && v.targetIndex === targetIndex
        );
        if (!isSubstitution) {
          diff.push({
            value: userWords[targetIndex],
            type: 'insertion',
          });
        }
        targetIndex++;
      }
    }

    // Handle any remaining insertions at the end
    while (targetIndex < userWords.length) {
      diff.push({
        value: userWords[targetIndex],
        type: 'insertion',
      });
      targetIndex++;
    }

    return diff;
  }
}
