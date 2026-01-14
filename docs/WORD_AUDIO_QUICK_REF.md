# Word Audio - Quick Reference

## 🎯 What Was Implemented

Word-level click-to-hear audio in Reading Mode using sentence audio segmentation.

---

## 📦 New Files

```
hooks/useWordAudio.ts          # Extract word from sentence audio
hooks/useSentenceAudio.ts      # Load sentence as AudioBuffer
components/practice/WordWithAudio.tsx  # Interactive word component
```

---

## 🔑 Key Concepts

### Audio Extraction
```
Sentence Audio: [0.0s ──────────── 2.5s]
                [0.0-0.5] [0.5-1.2] [1.2-2.5]
                   "O"     "aluno"    "corre"
                   
Click "aluno" → Extract [0.5-1.2] → Play
```

### State Coordination
```typescript
// Word clicks only enabled when sentence NOT playing
const interactionsEnabled = !sentenceAudio.isPlaying;

// Sentence starts → stop word audio
useEffect(() => {
  if (sentenceAudio.isPlaying) wordAudio.stopWord();
}, [sentenceAudio.isPlaying]);
```

---

## 🎨 User Experience

### Word States

| State | Appearance | Cursor | Clickable |
|-------|-----------|--------|-----------|
| Default | Gray text | pointer | ✅ |
| Hover | Scaled 105% | pointer | ✅ |
| Playing word | Yellow bg, ring | pointer | ✅ |
| Sentence playing | Auto-highlight | not-allowed | ❌ |

### Interactions

```
Hover (when paused)    → Visual highlight
Click (when paused)    → Play word audio
Click (during sentence)→ Ignored
Enter/Space           → Play word audio (keyboard)
```

---

## 🔧 Usage Example

```tsx
import { useSentenceAudio } from '@/hooks/useSentenceAudio';
import { useWordAudio } from '@/hooks/useWordAudio';
import { WordWithAudio } from '@/components/practice/WordWithAudio';

function ReadingComponent() {
  const sentenceAudio = useSentenceAudio();
  const wordAudio = useWordAudio();

  // Load audio
  useEffect(() => {
    sentenceAudio.loadAudio('/audio/sentence.m4a');
  }, []);

  // Word click handler
  const handleWordClick = async (word, timing) => {
    if (sentenceAudio.audioBuffer && !sentenceAudio.isPlaying) {
      await wordAudio.playWord(word, timing, sentenceAudio.audioBuffer);
    }
  };

  return (
    <div>
      {/* Play sentence button */}
      <button onClick={() => sentenceAudio.play()}>
        Play Sentence
      </button>

      {/* Interactive words */}
      {words.map((word, i) => (
        <WordWithAudio
          key={i}
          word={word}
          index={i}
          isHighlightedBySentence={highlightIndex === i}
          isPlayingWord={wordAudio.currentPlayingWord === word}
          interactionsEnabled={!sentenceAudio.isPlaying}
          wordTiming={timings[i]}
          onWordClick={handleWordClick}
        />
      ))}
    </div>
  );
}
```

---

## 🚨 Common Issues

### Words Not Clickable?
1. Check `sentenceAudio.audioBuffer` is loaded
2. Ensure `wordTiming` prop is provided
3. Verify sentence is not playing

### No Audio Playing?
1. Check AudioContext not suspended
2. Ensure browser allows autoplay
3. Verify audio file loaded (Network tab)

### Wrong Audio Playing?
1. Check `wordTiming` indices match word order
2. Verify timing data (start < end)

---

## ✅ Verification Checklist

After implementation:
- [ ] Words have pointer cursor when hoverable
- [ ] Clicking word plays its audio
- [ ] Hovering shows visual feedback
- [ ] Sentence playback disables word clicks
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Mobile touch works
- [ ] No console errors
- [ ] Works in Safari (iOS)

---

## 🎯 Key Benefits

✅ **Zero latency** - No network requests  
✅ **Professional audio** - Uses existing recordings  
✅ **No new assets** - Leverages `WordTiming` data  
✅ **Conflict-free** - Proper state management  
✅ **Accessible** - Full keyboard + screen reader support  

---

## 📖 Full Documentation

See [WORD_AUDIO_IMPLEMENTATION.md](./WORD_AUDIO_IMPLEMENTATION.md) for complete details.
