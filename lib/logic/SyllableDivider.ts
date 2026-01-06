/**
 * SyllableDivider - Portuguese syllable splitting algorithm
 * Ported from syllable-divider.js with exact regex patterns preserved
 */
export class SyllableDivider {
  /**
   * Split Portuguese text into syllables
   * @param text - Text to split into syllables
   * @returns Array of syllables with punctuation handled
   */
  static split(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const words = text.split(/\s+/);
    const allSyllables: string[] = [];

    for (const word of words) {
      if (!word.trim()) continue;

      const syllables = this.splitWordIntoSyllables(word);
      allSyllables.push(...syllables);
    }

    return allSyllables;
  }

  /**
   * Split a single word into syllables
   * @param word - Word to split
   * @returns Array of syllables for this word
   */
  private static splitWordIntoSyllables(word: string): string[] {
    // Handle empty or whitespace-only words
    if (!word.trim()) {
      return [];
    }

    // Extract leading/trailing punctuation
    const punctMatch = word.match(/^([^\p{L}]*)(.+?)([^\p{L}]*)$/u);
    if (!punctMatch) {
      return [word];
    }

    const [, leadingPunct, core, trailingPunct] = punctMatch;
    
    if (!core) {
      return [word];
    }

    // Split the core word into syllables
    const syllables = this.splitCore(core.toLowerCase());

    // Attach punctuation
    const result: string[] = [];
    
    if (leadingPunct) {
      result.push(leadingPunct);
    }

    result.push(...syllables);

    if (trailingPunct) {
      // Attach trailing punctuation to last syllable
      if (result.length > 0) {
        result[result.length - 1] += trailingPunct;
      } else {
        result.push(trailingPunct);
      }
    }

    return result;
  }

  /**
   * Split core word (without punctuation) into syllables
   * Implements Portuguese syllable division rules
   */
  private static splitCore(word: string): string[] {
    const vowels = 'aeiouáéíóúâêôãõàü';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    
    // Special digraphs and letter combinations in Portuguese
    const digraphs = ['ch', 'lh', 'nh', 'rr', 'ss', 'qu', 'gu'];
    
    const syllables: string[] = [];
    let currentSyllable = '';
    let i = 0;

    while (i < word.length) {
      const char = word[i];
      const nextChar = word[i + 1] || '';
      const twoChars = char + nextChar;

      // Check for digraphs (they stay together)
      if (digraphs.includes(twoChars.toLowerCase())) {
        currentSyllable += twoChars;
        i += 2;
        continue;
      }

      // Check if current char is a vowel
      if (vowels.includes(char.toLowerCase())) {
        currentSyllable += char;
        
        // Look ahead for diphthongs (two vowels that form one syllable)
        if (i + 1 < word.length && vowels.includes(word[i + 1].toLowerCase())) {
          const vowelPair = char.toLowerCase() + word[i + 1].toLowerCase();
          
          // Common Portuguese diphthongs
          const diphthongs = ['ai', 'ei', 'oi', 'ui', 'au', 'eu', 'iu', 'ou', 
                             'ãe', 'ão', 'õe', 'ae', 'ao', 'oe'];
          
          if (diphthongs.includes(vowelPair)) {
            currentSyllable += word[i + 1];
            i++;
          }
        }
        
        // After a vowel, check what comes next
        if (i + 1 < word.length) {
          const nextIsVowel = vowels.includes(word[i + 1].toLowerCase());
          const nextIsConsonant = consonants.includes(word[i + 1].toLowerCase());

          if (nextIsConsonant) {
            // Look at consonant cluster ahead
            let consonantCluster = '';
            let j = i + 1;
            
            while (j < word.length && consonants.includes(word[j].toLowerCase())) {
              consonantCluster += word[j];
              j++;
            }

            // Portuguese syllable division rules for consonant clusters
            if (consonantCluster.length === 1) {
              // Single consonant: CV|CV pattern
              syllables.push(currentSyllable);
              currentSyllable = '';
            } else if (consonantCluster.length === 2) {
              const firstC = consonantCluster[0].toLowerCase();
              const secondC = consonantCluster[1].toLowerCase();
              
              // Check if they form a valid onset (bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tl, tr, vr)
              const validOnsets = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tl', 'tr', 'vr'];
              
              if (validOnsets.includes(firstC + secondC)) {
                // Keep cluster together with next vowel: CV|CCV
                syllables.push(currentSyllable);
                currentSyllable = '';
              } else {
                // Split cluster: CVC|CV
                currentSyllable += consonantCluster[0];
                syllables.push(currentSyllable);
                currentSyllable = '';
              }
            } else {
              // Three or more consonants: take first consonant with current syllable
              currentSyllable += consonantCluster[0];
              syllables.push(currentSyllable);
              currentSyllable = '';
            }
          } else if (nextIsVowel) {
            // Vowel followed by vowel: usually separate syllables (unless diphthong, handled above)
            syllables.push(currentSyllable);
            currentSyllable = '';
          }
        } else {
          // End of word
          syllables.push(currentSyllable);
          currentSyllable = '';
        }
        
        i++;
      } else {
        // Consonant: add to current syllable
        currentSyllable += char;
        i++;
      }
    }

    // Add any remaining syllable
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }

    // Filter out empty syllables
    return syllables.filter(s => s.length > 0);
  }
}
