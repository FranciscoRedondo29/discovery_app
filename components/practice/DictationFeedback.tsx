import React from 'react';
import type { DiffToken } from '@/lib/logic/dictation';// Já tens:
{
  word: "aluno",
  start: 0.5,  // segundos
  end: 1.2
}

// Solução:
1. Carregar AudioBuffer da frase (já fazes isto)
2. Extrair samples [0.5s → 1.2s]
3. Criar novo AudioBuffer só com esses samples
4. Reproduzir quando user clica// playWord("aluno")
await playSyllable("a");   // → gap
await playSyllable("lu");  // → gap
await playSyllable("no");const buffer = concatenate([
  loadSyllable("a"),
  loadSyllable("lu"),
  loadSyllable("no")
]);// playWord("aluno")
await playSyllable("a");   // → gap
await playSyllable("lu");  // → gap
await playSyllable("no");// playWord("aluno")
await playSyllable("a");   // → gap
await playSyllable("lu");  // → gap
await playSyllable("no");// playWord("aluno")
await playSyllable("a");   // → gap
await playSyllable("lu");  // → gap
await playSyllable("no");// playWord("aluno")
await playSyllable("a");   // → gap
await playSyllable("lu");  // → gap
await playSyllable("no");// hooks/useWordAudio.ts
export function useWordAudio() {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const playWord = async (
    word: string,
    wordTiming: WordTiming,
    sentenceBuffer: AudioBuffer
  ) => {
    // 1. Extract segment
    const start = wordTiming.start * sampleRate;
    const end = wordTiming.end * sampleRate;
    const duration = end - start;

    // 2. Create new buffer
    const wordBuffer = audioContext.createBuffer(
      channels,
      duration,
      sampleRate
    );

    // 3. Copy audio data
    for (let i = 0; i < duration; i++) {
      wordBuffer[i] = sentenceBuffer[start + i];
    }

    // 4. Play
    const source = audioContext.createBufferSource();
    source.buffer = wordBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    setIsPlayingWord(true);
    source.onended = () => setIsPlayingWord(false);
  };

  return { playWord, isPlayingWord };
}// Stop word audio when sentence starts
useEffect(() => {
  if (wordHighlight.isPlaying) {
    wordAudio.stopWord();
  }
}, [wordHighlight.isPlaying]);

// Disable word clicks during sentence playback
const canClickWord = !wordHighlight.isPlaying && !isLoading;┌─────────────────┬──────────────┬─────────────┬───────────┐
│ Approach        │ Audio Quality│ Latency     │ MVP-Ready │
├─────────────────┼──────────────┼─────────────┼───────────┤
│ Segmentation ✅ │ ⭐⭐⭐⭐⭐      │ Instant     │ YES       │
│ Syllables Seq   │ ⭐⭐          │ Fast        │ Needs work│
│ Concatenation   │ ⭐⭐⭐         │ Fast        │ Complex   │
│ Hybrid          │ ⭐⭐⭐⭐       │ Fast        │ Phase 2   │
└─────────────────┴──────────────┴─────────────┴───────────┘

interface DictationFeedbackProps {
  tokens: DiffToken[];
  className?: string;
}

export function DictationFeedback({ tokens, className = '' }: DictationFeedbackProps) {
  if (tokens.length === 0) {
    return (
      <div className={`text-center text-text-primary/60 py-8 ${className}`}>
        Nenhum feedback disponível
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Análise Detalhada:
      </h3>
      
      <div 
        className="text-2xl leading-relaxed space-x-2 md:space-x-3"
        style={{ fontFamily: "OpenDyslexic, Arial, sans-serif" }}
      >
        {tokens.map((token, index) => {
          if (token.type === 'correct') {
            return (
              <span
                key={index}
                className="inline-block text-gray-900 mr-2 md:mr-3"
                title="Palavra correta"
              >
                {token.value}
              </span>
            );
          } else if (token.type === 'added') {
            return (
              <span
                key={index}
                className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded-md line-through font-medium"
                title="Palavra errada ou extra"
              >
                {token.value}
              </span>
            );
          } else if (token.type === 'missing') {
            return (
              <span
                key={index}
                className="inline-block text-green-600 font-semibold px-2 py-1 rounded-md"
                title="Palavra em falta - deveria estar aqui"
              >
                {token.value}
              </span>
            );
          }
          return null;
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-900 rounded"></div>
          <span className="text-text-primary/70">Correto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-text-primary/70">Erro (escreveste isto)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-text-primary/70">Em falta (deveria ser isto)</span>
        </div>
      </div>
    </div>
  );
}
