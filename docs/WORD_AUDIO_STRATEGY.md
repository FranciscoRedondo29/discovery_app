# Word-Level Audio Strategy - Technical Design Document

## 📊 Current State Analysis

### What Currently Exists

#### Audio Infrastructure
- ✅ **Sentence-level audio files**: Pre-recorded audio for complete phrases stored in DB/filesystem
- ✅ **Syllable-level audio files**: Individual syllable recordings in `/public/Sílabas/` (e.g., "A", "lu", "no")
- ✅ **Word timings**: Timestamp data (`WordTiming[]`) with `start`/`end` times for each word in sentence audio
- ❌ **Word-level audio files**: Not available - this is the constraint we must work within

#### Current Playback Behavior
```tsx
// Sentence playback with word highlighting
{currentText.split(/\s+/).map((word, index) => (
  <span
    key={`${index}-${word}`}
    className={wordHighlight.currentWordIndex === index ? "highlighted" : ""}
  >
    {word}
  </span>
))}
```

- **Global Play/Pause**: Plays entire sentence audio
- **Synchronized highlighting**: `useWordHighlight` hook tracks `currentWordIndex` using `wordTimings`
- **Word rendering**: Words are display-only `<span>` elements with no click handlers
- **Audio sources**: 
  - Sentence mode: Pre-recorded phrase audio
  - Syllable mode (dev): Sequential syllable playback using `useSyllableAudio`

#### Existing Hooks
1. **`usePhraseAudio`**: Text-to-speech for any text (uses ElevenLabs API)
2. **`useWordHighlight`**: Synchronized word highlighting using `WordTiming[]` from audio
3. **`useSyllableAudio`**: Plays syllables sequentially with localStorage caching
4. **`useHighlightPlayback`**: Syllable-by-syllable playback with highlighting

---

## 🎯 Goal: Add Word-Level Audio on Click

### Requirements
1. ✅ Click any word to hear it spoken
2. ✅ No word-level audio files required (construct dynamically)
3. ✅ Preserve existing sentence playback behavior
4. ✅ Preserve existing word highlighting logic
5. ✅ No visual redesign
6. ✅ No backend changes

### User Experience Constraints
- Word audio cannot play during sentence playback (avoid audio conflicts)
- Clicking a word while sentence is playing should be disabled/ignored
- Word click should provide instant feedback (no noticeable delay)

---

## 🔬 Technical Approaches - Analysis

### Approach 1: Syllable Concatenation/Sequencing

#### Strategy
Dynamically construct word audio by playing syllables in sequence.

```typescript
// Example: "aluno" → ["a", "lu", "no"]
const word = "aluno";
const syllables = splitIntoSyllables(word); // ["a", "lu", "no"]
await playWordFromSyllables(syllables);
```

#### Implementation Variants

##### Option 1A: Sequential Playback (No Concatenation)
Play syllable audio files one after another with minimal gap.

```typescript
async function playWordFromSyllables(syllables: string[]) {
  for (const syllable of syllables) {
    const audioPath = `/public/Sílabas/${syllable}.m4a`;
    await playSyllable(audioPath); // Wait for completion
  }
}
```

**Pros:**
- ✅ Simple implementation - reuse existing `useSyllableAudio` logic
- ✅ No audio processing required
- ✅ Works with existing file structure
- ✅ Can leverage localStorage cache already in `useSyllableAudio`

**Cons:**
- ⚠️ Syllable separation audible (unnatural word pronunciation)
- ⚠️ Timing/gaps between syllables require fine-tuning
- ⚠️ Requires accurate syllable splitting algorithm
- ⚠️ Portuguese syllable rules are complex (hyphenation ≠ pronunciation)

##### Option 1B: Web Audio API Concatenation
Load all syllable audio buffers and concatenate into single `AudioBuffer`.

```typescript
async function concatenateSyllableAudio(syllables: string[]): Promise<AudioBuffer> {
  const audioContext = new AudioContext();
  const buffers = await Promise.all(
    syllables.map(s => loadSyllableBuffer(s))
  );
  
  // Calculate total length
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
  
  // Create concatenated buffer
  const concatenated = audioContext.createBuffer(
    1, // mono
    totalLength,
    audioContext.sampleRate
  );
  
  let offset = 0;
  buffers.forEach(buffer => {
    concatenated.copyToChannel(buffer.getChannelData(0), 0, offset);
    offset += buffer.length;
  });
  
  return concatenated;
}
```

**Pros:**
- ✅ Smoother playback (single audio stream)
- ✅ Can control timing precisely
- ✅ Can cache concatenated result

**Cons:**
- ⚠️ More complex implementation
- ⚠️ Still requires syllable splitting
- ⚠️ Higher memory usage for caching
- ⚠️ Concatenation artifacts may still be audible

---

### Approach 2: Sentence Audio Segmentation

#### Strategy
Extract word audio from the existing sentence audio using `WordTiming` data.

```typescript
// Example: Extract "aluno" from sentence "O aluno corre"
const wordTiming = { word: "aluno", start: 0.5, end: 1.2 }; // seconds
await playWordSegment(sentenceAudioBuffer, wordTiming);
```

#### Implementation

```typescript
function extractWordAudio(
  sentenceBuffer: AudioBuffer,
  wordTiming: WordTiming
): AudioBuffer {
  const audioContext = new AudioContext();
  const sampleRate = sentenceBuffer.sampleRate;
  
  // Convert times to sample indices
  const startSample = Math.floor(wordTiming.start * sampleRate);
  const endSample = Math.floor(wordTiming.end * sampleRate);
  const duration = endSample - startSample;
  
  // Create new buffer with extracted segment
  const wordBuffer = audioContext.createBuffer(
    sentenceBuffer.numberOfChannels,
    duration,
    sampleRate
  );
  
  // Copy audio data
  for (let channel = 0; channel < sentenceBuffer.numberOfChannels; channel++) {
    const sourceData = sentenceBuffer.getChannelData(channel);
    const targetData = wordBuffer.getChannelData(channel);
    
    for (let i = 0; i < duration; i++) {
      targetData[i] = sourceData[startSample + i];
    }
  }
  
  return wordBuffer;
}
```

**Pros:**
- ✅ **Best audio quality**: Uses professionally recorded audio
- ✅ **Natural pronunciation**: Words pronounced in context
- ✅ **No syllable splitting required**
- ✅ **Data already exists**: `wordTimings` provided with sentences
- ✅ **Fast playback**: No API calls, immediate playback
- ✅ **Can cache efficiently**: Extract once, reuse

**Cons:**
- ⚠️ Only works for words that exist in phrases
- ⚠️ Requires loading sentence audio even for single word
- ⚠️ Word might sound contextual (intonation from sentence position)
- ⚠️ Dependency on accurate `wordTimings` data

---

### Approach 3: Hybrid Strategy

#### Strategy
Combine both approaches with fallback logic:

```typescript
async function playWord(word: string, context?: SentenceContext) {
  // Priority 1: Use sentence audio if available
  if (context?.wordTimings && context?.audioBuffer) {
    const timing = context.wordTimings.find(t => t.word === word);
    if (timing) {
      return playWordSegment(context.audioBuffer, timing);
    }
  }
  
  // Priority 2: Check for direct word audio file
  if (await wordAudioExists(word)) {
    return playWordAudio(word);
  }
  
  // Priority 3: Construct from syllables
  const syllables = splitIntoSyllables(word);
  return playWordFromSyllables(syllables);
}
```

**Pros:**
- ✅ Best of both worlds
- ✅ Graceful degradation
- ✅ Most flexible for future expansion

**Cons:**
- ⚠️ Most complex implementation
- ⚠️ Multiple codepaths to maintain
- ⚠️ Requires all infrastructure

---

## 🎯 Recommended Approach: **Sentence Audio Segmentation (Approach 2)**

### Rationale

For an **MVP focused on Reading Mode**, sentence audio segmentation is the clear winner:

1. **✅ Zero latency**: Audio already loaded for sentence playback
2. **✅ Professional quality**: Same audio quality as sentence playback
3. **✅ No additional assets**: Leverages existing `wordTimings` data
4. **✅ Simple implementation**: ~50 lines of code, reuse Web Audio API infrastructure
5. **✅ Perfect for current use case**: All words exist in context of sentences

### When This Approach Fails

This approach only fails if:
- User clicks word when sentence audio not loaded yet
- Word doesn't have `wordTimings` entry (data issue)

**Solution**: Show subtle loading indicator or disable click until sentence audio loads.

---

## 📐 Implementation Design - MVP

### Phase 1: Core Word Audio Hook

Create `useWordAudio` hook for extraction and playback:

```typescript
// hooks/useWordAudio.ts
import { useState, useCallback, useRef } from 'react';
import type { WordTiming } from '@/types/exercises';

interface UseWordAudioReturn {
  isPlayingWord: boolean;
  playWord: (word: string, wordTiming: WordTiming, sentenceBuffer: AudioBuffer) => Promise<void>;
  stopWord: () => void;
}

export function useWordAudio(): UseWordAudioReturn {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const stopWord = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlayingWord(false);
  }, []);

  const playWord = useCallback(async (
    word: string,
    wordTiming: WordTiming,
    sentenceBuffer: AudioBuffer
  ) => {
    // Stop any existing playback
    stopWord();

    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    // Extract word segment
    const sampleRate = sentenceBuffer.sampleRate;
    const startSample = Math.floor(wordTiming.start * sampleRate);
    const endSample = Math.floor(wordTiming.end * sampleRate);
    const duration = endSample - startSample;

    const wordBuffer = audioContext.createBuffer(
      sentenceBuffer.numberOfChannels,
      duration,
      sampleRate
    );

    // Copy audio data for each channel
    for (let channel = 0; channel < sentenceBuffer.numberOfChannels; channel++) {
      const sourceData = sentenceBuffer.getChannelData(channel);
      const targetData = wordBuffer.getChannelData(channel);
      
      for (let i = 0; i < duration; i++) {
        targetData[i] = sourceData[startSample + i];
      }
    }

    // Create and play source
    const source = audioContext.createBufferSource();
    source.buffer = wordBuffer;
    source.connect(audioContext.destination);
    sourceNodeRef.current = source;

    setIsPlayingWord(true);

    source.onended = () => {
      stopWord();
    };

    source.start(0);
  }, [stopWord]);

  return {
    isPlayingWord,
    playWord,
    stopWord,
  };
}
```

### Phase 2: Sentence Audio Loading

Extend existing audio loading to provide buffer access:

```typescript
// Modify usePhraseAudio or create new hook
interface ExtendedPhraseAudioReturn {
  // ... existing returns
  audioBuffer: AudioBuffer | null; // ← NEW: expose buffer
  isReady: boolean; // ← NEW: buffer loaded indicator
}
```

### Phase 3: Word Click Integration

Update word rendering in Reading Mode:

```tsx
// app/aluno/learning/page.tsx

const wordAudio = useWordAudio();

// ... existing code

{currentText.split(/\s+/).map((word, index) => {
  const wordTiming = currentPhrase?.wordTimings?.[index];
  
  return (
    <span
      key={`${index}-${word}`}
      onClick={() => {
        // Only allow click if sentence not playing
        if (!wordHighlight.isPlaying && wordTiming && audioBuffer) {
          wordAudio.playWord(word, wordTiming, audioBuffer);
        }
      }}
      className={`
        ${wordHighlight.currentWordIndex === index ? "highlighted" : ""}
        ${!wordHighlight.isPlaying ? "cursor-pointer hover:opacity-70" : "cursor-default"}
        ${wordAudio.isPlayingWord ? "animate-pulse" : ""}
      `}
    >
      {word}
    </span>
  );
})}
```

### Phase 4: State Coordination

Ensure audio state is mutually exclusive:

```typescript
// Disable word clicks when sentence playing
const canClickWord = !wordHighlight.isPlaying && !isLoading;

// Stop word audio if sentence playback starts
useEffect(() => {
  if (wordHighlight.isPlaying) {
    wordAudio.stopWord();
  }
}, [wordHighlight.isPlaying]);
```

---

## 🔄 Progressive Enhancement Path

### MVP (Immediate)
- ✅ Word click → extract from sentence audio → play
- ✅ Visual feedback (cursor, hover state)
- ✅ Disable during sentence playback

### Phase 2 (Short-term)
- 🔄 Cache extracted word audio (avoid re-extraction)
- 🔄 Add subtle audio loading indicator
- 🔄 Keyboard navigation (arrow keys to select words, Enter to play)

### Phase 3 (Medium-term)
- 🔄 Fallback to syllable-based audio for words not in sentences
- 🔄 Support for custom text input (typing practice mode)
- 🔄 Generate word-level audio files in background (optimization)

### Phase 4 (Long-term)
- 🔄 Pre-generate and store word-level audio in database
- 🔄 API endpoint for on-demand word audio generation
- 🔄 Analytics: track which words students click most

---

## 🚨 Edge Cases & Error Handling

| Scenario | Handling Strategy |
|----------|-------------------|
| Sentence audio not yet loaded | Disable word clicks until loaded, show subtle loader |
| `wordTimings` data missing/corrupt | Fallback to syllable mode or show error tooltip |
| User clicks rapidly on multiple words | Debounce clicks, stop previous word audio |
| Audio context suspended (iOS) | Resume context on first user interaction |
| Word not found in `wordTimings` | Log warning, gracefully fail (no playback) |
| Very short words (<0.1s duration) | Set minimum duration threshold, pad if needed |

---

## 📊 Performance Considerations

### Memory Usage
- **Sentence audio buffer**: ~1-3MB per phrase (already loaded)
- **Extracted word buffer**: ~50-200KB (ephemeral, GC'd quickly)
- **Caching strategy**: Cache extracted words in Map, max 50 entries

### CPU/Processing
- **Extraction**: ~1-2ms per word (negligible)
- **Playback**: Native Web Audio API (hardware accelerated)

### Network
- **No additional network requests** for MVP (use existing assets)
- Future: Consider lazy-loading sentence audio only when needed

---

## 🧪 Testing Strategy

### Manual Testing
1. ✅ Click word in each difficulty level
2. ✅ Click multiple words in sequence
3. ✅ Click word while sentence playing (should be disabled)
4. ✅ Click word, then start sentence playback (word should stop)
5. ✅ Test on mobile devices (touch interactions)
6. ✅ Test with slow network (audio loading edge cases)

### Automated Testing
```typescript
describe('useWordAudio', () => {
  it('extracts correct audio segment from sentence buffer', () => {
    // Mock AudioBuffer
    // Test extraction logic
  });

  it('stops playing word when new word clicked', () => {
    // Test state management
  });
});
```

---

## 🎨 UI/UX Enhancements (Optional)

### Visual Feedback
```css
/* Subtle hover effect */
.word-clickable {
  cursor: pointer;
  transition: all 0.15s ease;
}

.word-clickable:hover {
  color: #E5A534; /* Primary yellow */
  transform: scale(1.05);
}

/* Playing word indicator */
.word-playing {
  background: linear-gradient(135deg, #E5A534 0%, #F4B942 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(229, 165, 52, 0.3);
}
```

### Accessibility
- Add `role="button"` to clickable words
- Add `aria-label="Ouvir palavra: {word}"`
- Keyboard support: Tab to focus, Enter/Space to play

---

## 📝 Code Organization

```
hooks/
  useWordAudio.ts          # NEW: Word extraction & playback
  useWordHighlight.ts      # EXISTING: Sentence-level highlighting
  usePhraseAudio.ts        # EXISTING: Sentence audio loading
  useSyllableAudio.ts      # EXISTING: Fallback option

components/practice/
  WordWithAudio.tsx        # NEW: Reusable word component with audio
  ReadingDisplay.tsx       # NEW: Extract reading UI from page

app/aluno/learning/
  page.tsx                 # MODIFY: Integrate word audio
```

---

## 🚀 Implementation Checklist

### Step 1: Create `useWordAudio` hook
- [ ] Implement audio extraction logic
- [ ] Implement playback controls
- [ ] Add error handling
- [ ] Test with sample audio

### Step 2: Expose `audioBuffer` in existing hooks
- [ ] Modify `usePhraseAudio` or relevant audio hook
- [ ] Ensure buffer is available when sentence loaded
- [ ] Add loading state indicator

### Step 3: Update word rendering
- [ ] Add onClick handler to word spans
- [ ] Add hover styles
- [ ] Add disable logic during sentence playback
- [ ] Add visual feedback for playing word

### Step 4: State coordination
- [ ] Stop word audio when sentence starts
- [ ] Disable word clicks during sentence playback
- [ ] Handle edge cases (rapid clicks, errors)

### Step 5: Testing & refinement
- [ ] Test all difficulty levels
- [ ] Test on mobile devices
- [ ] Test edge cases
- [ ] Gather user feedback

---

## 🎓 Pedagogical Benefits

Adding word-level audio enhances the learning experience:

1. **Targeted practice**: Students can repeat specific challenging words
2. **Self-paced learning**: Break down sentences at their own speed
3. **Pronunciation focus**: Hear individual words clearly
4. **Confidence building**: Master words before full sentence
5. **Dyslexia support**: Reduce cognitive load by focusing on one word

---

## 📚 References

- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [AudioBuffer - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer)
- Portuguese syllabification rules
- Dyslexia-friendly UI patterns

---

## 🤝 Next Steps

After implementing MVP:
1. Gather usage analytics (which words clicked most)
2. Consider pre-generating popular words
3. Explore TTS for dynamic text input
4. Integrate with progress tracking
5. Add word difficulty ratings based on clicks

---

**Document Status**: ✅ Ready for Implementation  
**Estimated Effort**: 4-6 hours for MVP  
**Dependencies**: Existing audio infrastructure, Web Audio API  
**Risk Level**: Low (uses proven technologies)
