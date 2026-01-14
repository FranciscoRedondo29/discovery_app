# Word Audio - Quick Summary

## 🎯 Objetivo
Adicionar click-to-hear em palavras individuais no Reading Mode, **sem** ficheiros de áudio por palavra.

## 🔍 Estado Atual
- ✅ Áudio de frases completas existe
- ✅ `wordTimings` (timestamps por palavra) existe  
- ✅ Highlighting durante playback funciona
- ❌ Palavras não são clicáveis
- ❌ Não existe áudio individual por palavra

## 💡 Solução Recomendada: **Segmentação do Áudio da Frase**

### Conceito
Extrair áudio de cada palavra **diretamente do áudio da frase**, usando os `wordTimings`:

```
Frase: "O aluno corre"
Audio: [0.0s ──────────── 2.5s]
       [0.0-0.5s] [0.5-1.2s] [1.2-2.5s]
          "O"      "aluno"     "corre"
```

Quando user clica em "aluno" → extrair segmento [0.5s - 1.2s] → reproduzir

### Porquê Esta Abordagem?
| Critério | Avaliação |
|----------|-----------|
| Qualidade áudio | ✅ **Profissional** (mesmo que frase) |
| Latência | ✅ **Zero** (áudio já carregado) |
| Assets necessários | ✅ **Nenhum** (usa o que existe) |
| Complexidade | ✅ **Simples** (~50 linhas código) |
| Funciona para Reading Mode? | ✅ **Sim** (todas as palavras têm contexto) |

## 🏗️ Implementação (3 passos)

### 1. Criar Hook `useWordAudio`
```typescript
// hooks/useWordAudio.ts
export function useWordAudio() {
  const playWord = async (
    word: string,
    wordTiming: WordTiming,
    sentenceBuffer: AudioBuffer
  ) => {
    // 1. Extrair segmento: [wordTiming.start → wordTiming.end]
    // 2. Criar novo AudioBuffer com esse segmento
    // 3. Reproduzir
  };
  
  return { playWord, isPlayingWord, stopWord };
}
```

### 2. Adicionar Click Handler
```tsx
// app/aluno/learning/page.tsx
const wordAudio = useWordAudio();

{currentText.split(/\s+/).map((word, index) => (
  <span
    onClick={() => {
      if (!sentencePlaying) {  // ← bloqueio
        wordAudio.playWord(
          word,
          currentPhrase.wordTimings[index],
          audioBuffer  // ← já carregado
        );
      }
    }}
    className={canClick ? "cursor-pointer" : ""}
  >
    {word}
  </span>
))}
```

### 3. Coordenar Estado
```typescript
// Parar palavra quando frase começa
useEffect(() => {
  if (wordHighlight.isPlaying) {
    wordAudio.stopWord();
  }
}, [wordHighlight.isPlaying]);
```

## 🚨 Edge Cases
| Caso | Solução |
|------|---------|
| Áudio da frase ainda a carregar | Disable clicks, mostrar loader |
| Cliques rápidos em várias palavras | Stop anterior antes de novo |
| `wordTimings` em falta | Graceful fail (sem playback) |
| User clica durante playback | Ignorar (click disabled) |

## ⚖️ Alternativas Consideradas (e porquê não)

### ❌ Sílabas Sequenciais
Reproduzir `["a", "lu", "no"]` uma após outra.

**Problemas:**
- Sons separados (não natural)
- Requer algoritmo de silabificação perfeito
- Gaps audíveis entre sílabas

### ❌ Concatenação com Web Audio API
Juntar buffers de sílabas num único AudioBuffer.

**Problemas:**
- Mais complexo
- Ainda requer silabificação
- Artefactos de concatenação

### ✅ Híbrido (Futuro)
Usar segmentação para palavras em frases, sílabas para texto livre.

**Quando:** Fase 2, quando houver input dinâmico de texto.

## 📊 Comparação Rápida

| Abordagem | Qualidade | Latência | Complexidade | Funciona Agora? |
|-----------|-----------|----------|--------------|-----------------|
| **Segmentação** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| Sílabas Seq | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⚠️ (precisa silabificação) |
| Concatenação | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⚠️ (precisa silabificação) |
| Híbrido | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | 🔄 (para fase 2) |

## 🎯 MVP Scope

**In Scope:**
- ✅ Click palavra → ouvir
- ✅ Visual feedback (hover, playing state)
- ✅ Disable durante playback de frase
- ✅ Stop palavra quando frase começa

**Out of Scope (MVP):**
- ❌ Caching de palavras extraídas
- ❌ Teclado navigation
- ❌ Fallback para sílabas
- ❌ Analytics de cliques

## 📈 Roadmap

### MVP (Agora)
Segmentação básica + click handling

### Fase 2
Cache + keyboard nav + analytics

### Fase 3
Fallback sílabas para texto livre

### Fase 4
Pre-generate word audio files (otimização)

## 💻 Effort Estimate
- **MVP**: 4-6 horas
- **Com testes**: +2 horas
- **Refinements**: +2-3 horas

## ✅ Decision
**Proceed with Sentence Audio Segmentation** para MVP.

Razões:
1. Máxima qualidade
2. Zero assets adicionais
3. Implementação direta
4. Perfeito para Reading Mode (contexto sempre existe)

---

**Ver documento completo:** [WORD_AUDIO_STRATEGY.md](./WORD_AUDIO_STRATEGY.md)
