export class TextNormalization {
  /**
   * Remove pontuação e converte para minúsculas para análise fonológica.
   * Mantém acentos portugueses.
   */
  static normalizeForComparison(text: string): string {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"«»—]/g, "") // Remove pontuação
      .replace(/\s{2,}/g, " ") // Remove espaços extra
      .trim();
  }

  /**
   * Verifica se é uma letra (para distinguir de pontuação)
   */
  static isLetter(char: string): boolean {
    return /[a-záàâãéêíóôõúüç]/i.test(char);
  }
}
