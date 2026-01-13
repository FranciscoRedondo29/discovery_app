# Reading Mode: Quick Implementation Guide

**Goal:** Integrate backend with existing frontend (zero visual changes)

---

## Setup (5 minutes)

### 1. Run Database Migrations

```bash
# In Supabase SQL Editor, run these in order:
```

1. [supabase-reading-mode-schema.sql](../database/supabase-reading-mode-schema.sql) - Creates tables & functions
2. [supabase-reading-mode-seed.sql](../database/supabase-reading-mode-seed.sql) - Populates 32 exercises

### 2. Verify Installation

```sql
-- Should return: easy: 11, medium: 10, hard: 11
SELECT difficulty, COUNT(*) 
FROM reading_exercises 
GROUP BY difficulty;
```

---

## Code Changes (15 minutes)

### File: `app/aluno/learning/page.tsx`

#### Change 1: Import Backend Functions

```typescript
// Add to imports
import { 
  getNextReadingExercise,
  getAllReadingExercises,
  markReadingExerciseComplete,
  getCompletedExerciseIds,
  resetReadingProgress
} from "@/lib/readingMode";
import { supabase } from "@/lib/supabaseClient";
```

#### Change 2: Get Student ID

```typescript
// Add at top of component
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  }
  getUser();
}, []);
```

#### Change 3: Replace `loadNextPhrase()`

```typescript
// BEFORE:
function loadNextPhrase() {
  const phrasesForLevel = getPhrasesByLevel(difficulty);
  let nextPhrase = /* ... hardcoded logic ... */;
  setCurrentPhrase(nextPhrase);
}

// AFTER:
async function loadNextPhrase() {
  if (!userId) return;
  
  setIsLoading(true);
  setError("");
  
  try {
    const exercise = await getNextReadingExercise(userId, difficulty);
    
    if (!exercise) {
      setError("🎉 Completaste todos os exercícios!");
      setIsLoading(false);
      return;
    }
    
    // Transform backend format to frontend format
    const phrase = {
      id: exercise.number,
      level: exercise.difficulty,
      text: exercise.text,
      syllables: exercise.syllables,
      audioFile: exercise.audioFile,
      wordTimings: exercise.wordTimings
    };
    
    setCurrentText(phrase.text);
    setCurrentPhrase(phrase);
    setSelectedPhraseId(phrase.id);
  } catch (err) {
    console.error("Error loading exercise:", err);
    setError("Erro ao carregar exercício");
  } finally {
    setIsLoading(false);
  }
}
```

#### Change 4: Track Completion

```typescript
// FIND this useEffect (around line 55):
useEffect(() => {
  if (isPlaybackStarted && !highlight.isPlaying && !wordHighlight.isPlaying) {
    setHasFinishedPlayback(true);
    setIsPlaybackStarted(false);
    
    // ADD THIS:
    if (currentPhrase && userId) {
      // Store exercise UUID for completion tracking
      const exerciseUUID = currentPhrase.id; // You'll need to store this
      markReadingExerciseComplete(userId, exerciseUUID, difficulty);
      setCompletedExercises(prev => new Set([...prev, currentPhrase.id]));
    }
  }
}, [highlight.isPlaying, wordHighlight.isPlaying, isPlaybackStarted, currentPhrase]);
```

#### Change 5: Load Progress on Mount

```typescript
// MODIFY existing useEffect:
useEffect(() => {
  if (userId) {
    loadProgress();
    loadNextPhrase();
  }
}, [userId, difficulty]); // Add userId dependency

async function loadProgress() {
  if (!userId) return;
  
  try {
    const completedIds = await getCompletedExerciseIds(userId, difficulty);
    // Map UUIDs to exercise numbers (requires helper)
    const exercises = await getAllReadingExercises(difficulty);
    const completedNumbers = exercises
      .filter(ex => completedIds.includes(ex.id))
      .map(ex => ex.number);
    setCompletedExercises(new Set(completedNumbers));
  } catch (err) {
    console.error("Error loading progress:", err);
  }
}
```

#### Change 6: Update Restart Button

```typescript
// FIND restart button (around line 370):
<button
  onClick={async () => {
    if (!userId) return;
    
    // Reset in database
    await resetReadingProgress(userId, difficulty);
    
    // Reset local state
    setCompletedExercises(new Set());
    setHasFinishedPlayback(false);
    setIsPlaybackStarted(false);
    
    // Load first exercise
    loadNextPhrase();
  }}
  className="absolute top-4 right-4..."
>
  <RefreshCw className="h-5 w-5" />
</button>
```

#### Change 7: Update Progress Dots

```typescript
// FIND progress dots (around line 325):
<div className="flex gap-3">
  {/* BEFORE: getPhrasesByLevel(difficulty).map(...) */}
  
  {/* AFTER: Load from database */}
  {allExercises.map((exercise) => (
    <button
      key={exercise.id}
      onClick={() => loadExercise(exercise.id)}
      className={`w-3 h-3 rounded-full ${
        completedExercises.has(exercise.number)
          ? 'bg-green-500'
          : exercise.number === currentPhrase?.id
          ? 'bg-green-300 ring-2 ring-green-400'
          : 'bg-gray-300'
      }`}
    />
  ))}
</div>
```

#### Change 8: Add State for All Exercises

```typescript
// Add near other state declarations:
const [allExercises, setAllExercises] = useState<ReadingExercise[]>([]);

// Load when difficulty changes:
useEffect(() => {
  if (userId) {
    loadAllExercises();
  }
}, [difficulty, userId]);

async function loadAllExercises() {
  const exercises = await getAllReadingExercises(difficulty);
  setAllExercises(exercises);
}
```

---

## Mapping Helper (Important!)

You need to track both:
- **Exercise UUID** (database ID) - for API calls
- **Exercise number** (1, 2, 3...) - for UI display

```typescript
// Add to state:
const [exerciseMap, setExerciseMap] = useState<Map<number, string>>(new Map());

// When loading exercise:
const phrase = {
  id: exercise.number,  // Display ID
  // ... other fields
};

// Store mapping:
setExerciseMap(prev => new Map(prev).set(exercise.number, exercise.id));

// When marking complete:
const uuid = exerciseMap.get(currentPhrase.id);
if (uuid) {
  await markReadingExerciseComplete(userId, uuid, difficulty);
}
```

---

## Testing Checklist

### Basic Flow
- [ ] Open reading mode page
- [ ] Exercise loads from database
- [ ] Click "Reproduzir" - audio plays
- [ ] Wait for playback to finish
- [ ] Progress dot turns green
- [ ] Click "Próxima Frase"
- [ ] Next sequential exercise loads

### Progress
- [ ] Refresh page - progress persists
- [ ] Switch difficulty - progress resets to correct level
- [ ] Complete all exercises - see completion message
- [ ] Click restart - all progress clears

### Edge Cases
- [ ] No internet - shows error
- [ ] Rapid button clicks - no duplicates
- [ ] Switch difficulty mid-exercise - doesn't break

---

## Troubleshooting

### "Exercise not loading"
```typescript
// Check console for errors
console.log('User ID:', userId);
console.log('Difficulty:', difficulty);

// Test backend directly:
const test = await getNextReadingExercise(userId, 'easy');
console.log('Exercise:', test);
```

### "Progress not saving"
```sql
-- Check in Supabase:
SELECT * FROM reading_progress 
WHERE student_id = 'your-user-id';
```

### "Can't see exercises"
```sql
-- Verify seed data:
SELECT COUNT(*) FROM reading_exercises;
-- Should be 32 total
```

---

## Performance Tips

1. **Cache exercises list**
   ```typescript
   // Load once, reuse
   const exercises = useMemo(() => getAllReadingExercises(difficulty), [difficulty]);
   ```

2. **Debounce completion**
   ```typescript
   // Prevent rapid-fire completions
   const markComplete = debounce(() => {
     markReadingExerciseComplete(...);
   }, 500);
   ```

3. **Optimistic UI**
   ```typescript
   // Update UI immediately, sync in background
   setCompletedExercises(prev => new Set([...prev, id]));
   markReadingExerciseComplete(userId, id, difficulty); // Don't await
   ```

---

## Next Steps

1. ✅ Complete basic integration (above)
2. Add metrics tracking (optional):
   ```typescript
   import { insertReadingMetrics } from "@/lib/readingMode";
   
   // On exercise complete:
   await insertReadingMetrics({
     studentId: userId,
     exerciseId: uuid,
     difficulty,
     playbackCount: clickCount,
     timeSpentSeconds: elapsed,
     playbackSpeed: playbackSpeed,
     syllableModeUsed: showSyllables
   });
   ```

3. Build analytics dashboard (future)
4. Add reading comprehension questions (future)

---

**Time Estimate:** 30 minutes total (setup + coding)  
**Complexity:** Low (mostly replacing hardcoded data)  
**Risk:** None (frontend behavior unchanged)

**Questions?** See [READING_MODE_BACKEND.md](./READING_MODE_BACKEND.md) for full details.
