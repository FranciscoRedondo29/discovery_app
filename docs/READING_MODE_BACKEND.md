# Reading Mode: Backend Architecture

**Status:** ✅ Production-ready backend for existing frontend  
**Last Updated:** January 13, 2026  
**Frontend:** Must remain unchanged (zero breaking changes)

---

## Overview

This backend implementation supports your existing Reading Mode frontend with:
- Deterministic exercise progression (sequential, not random)
- Per-student progress tracking
- Performance metrics storage
- Clean separation of concerns

**Key Principle:** The frontend already works perfectly. This backend makes it work with real data.

---

## Architecture

### Database Schema

```
reading_exercises
├── id (UUID)
├── number (INTEGER)              # Sequential order: 1, 2, 3...
├── difficulty (TEXT)             # 'easy' | 'medium' | 'hard'
├── text (TEXT)                   # "A lua."
├── audio_file (TEXT)             # "/audios/A lua.m4a"
├── word_timings (JSONB)          # [{word, start, end}, ...]
└── syllables (TEXT)              # "A lu-a." (optional)

reading_progress
├── id (UUID)
├── student_id (UUID → alunos)
├── exercise_id (UUID → reading_exercises)
├── difficulty (TEXT)
└── completed_at (TIMESTAMP)

reading_metrics
├── id (UUID)
├── student_id (UUID → alunos)
├── exercise_id (UUID → reading_exercises)
├── difficulty (TEXT)
├── playback_count (INTEGER)      # How many times "Reproduzir" clicked
├── time_spent_seconds (INTEGER)
├── accuracy_percent (DECIMAL)    # Future use
├── playback_speed (DECIMAL)      # 0.5 - 1.5
├── syllable_mode_used (BOOLEAN)
└── session_data (JSONB)          # Flexible for future needs
```

### Key Design Decisions

1. **Sequential Progression (Not Random)**
   - Exercises ordered by `number` field (1, 2, 3...)
   - Always returns lowest `number` not yet completed
   - No shuffling or randomization

2. **Progress Dots Mapping**
   - Frontend: `completedExercises: Set<number>` (phrase IDs)
   - Backend: `reading_progress` table tracks completed UUIDs
   - Transformation happens in API layer

3. **Audio Conventions**
   - Sentence audio: stored in `audio_file` field
   - Word audio: frontend handles from `/public/Silabas/[sentence]/[word].m4a`
   - Backend doesn't generate audio, only references existing files

4. **Metrics vs Progress**
   - **Progress:** Binary completion tracking (done/not done)
   - **Metrics:** Detailed analytics (time, playback count, etc.)
   - Both stored separately for flexibility

---

## API Functions

### 1. Exercise Fetching

#### `getNextReadingExercise(studentId, difficulty)`
**Purpose:** Get the next exercise to show  
**Logic:** Returns lowest `number` not yet in `reading_progress`  
**Returns:** `ReadingExercise | null`

```typescript
const exercise = await getNextReadingExercise(userId, 'easy');
// { id: "uuid", number: 1, text: "A lua.", audioFile: "/audios/...", ... }
```

**Edge Cases:**
- All exercises completed → returns `null`
- No exercises for difficulty → returns `null`
- Student ID invalid → returns `null`

#### `getAllReadingExercises(difficulty)`
**Purpose:** Get all exercises for progress dots  
**Returns:** `ReadingExercise[]` ordered by `number`

```typescript
const exercises = await getAllReadingExercises('easy');
// [{ number: 1, ... }, { number: 2, ... }, ...]
```

---

### 2. Progress Tracking

#### `markReadingExerciseComplete(studentId, exerciseId, difficulty)`
**Purpose:** Mark an exercise as completed (creates progress dot)  
**Idempotent:** Won't create duplicates  
**Returns:** `{ success: boolean; error?: string }`

```typescript
await markReadingExerciseComplete(userId, exerciseId, 'easy');
```

**When to Call:**
- After playback finishes (`hasFinishedPlayback = true`)
- Before moving to next exercise
- On "Próxima Frase" button click

#### `getReadingProgressSummary(studentId, difficulty)`
**Purpose:** Get progress overview  
**Returns:** `{ total_exercises, completed_exercises, next_exercise_number, progress_percent }`

```typescript
const summary = await getReadingProgressSummary(userId, 'easy');
// { total_exercises: 11, completed_exercises: 3, progress_percent: 27.27 }
```

#### `getCompletedExerciseIds(studentId, difficulty)`
**Purpose:** Get array of completed exercise UUIDs for progress dots  
**Returns:** `string[]` (UUIDs)

```typescript
const completed = await getCompletedExerciseIds(userId, 'easy');
// ["uuid1", "uuid2", "uuid3"]
```

#### `resetReadingProgress(studentId, difficulty)`
**Purpose:** Clear all progress (restart button)  
**Security:** RPC function checks `auth.uid() === studentId`

```typescript
await resetReadingProgress(userId, 'easy'); // Start over
```

---

### 3. Metrics & Analytics

#### `insertReadingMetrics(metrics)`
**Purpose:** Store session performance data  
**Optional:** Call when you want analytics

```typescript
await insertReadingMetrics({
  studentId: userId,
  exerciseId: exerciseId,
  difficulty: 'easy',
  playbackCount: 2,           // User clicked "Reproduzir" twice
  timeSpentSeconds: 45,        // 45 seconds on this exercise
  playbackSpeed: 1.0,          // Speed setting used
  syllableModeUsed: false      // Syllable division off
});
```

**What to Track:**
- `playbackCount`: Increment each time "Reproduzir" is clicked
- `timeSpentSeconds`: Track from component mount to next exercise
- `playbackSpeed`: Current slider value
- `syllableModeUsed`: Current toggle state

---

### 4. Combined Operations

#### `completeReadingExercise(studentId, exerciseId, difficulty, metrics?)`
**Purpose:** Mark complete + store metrics in one call  
**Recommended:** Use this instead of calling both functions separately

```typescript
await completeReadingExercise(userId, exerciseId, 'easy', {
  playbackCount: 1,
  timeSpentSeconds: 30,
  playbackSpeed: 1.0,
  syllableModeUsed: false
});
```

---

## Frontend Integration Guide

### Current Frontend Behavior (Must Preserve)

```typescript
// ✅ KEEP: These props must stay exactly as is
interface Phrase {
  id: number;              // Local ID (1, 2, 3...)
  level: 'easy' | 'medium' | 'hard';
  text: string;
  syllables?: string;
  audioFile?: string;
  wordTimings?: WordTiming[];
}

// ✅ KEEP: All state variables
const [difficulty, setDifficulty] = useState<Difficulty>("easy");
const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
```

### Integration Steps (Minimal Changes)

#### Step 1: Replace `loadNextPhrase()` Logic

**Before (hardcoded):**
```typescript
function loadNextPhrase() {
  const phrasesForLevel = getPhrasesByLevel(difficulty);
  const nextPhrase = phrasesForLevel[currentIndex + 1];
  setCurrentPhrase(nextPhrase);
}
```

**After (database-driven):**
```typescript
async function loadNextPhrase() {
  setIsLoading(true);
  try {
    const exercise = await getNextReadingExercise(userId, difficulty);
    if (!exercise) {
      // All exercises completed
      setError("Parabéns! Completaste todos os exercícios!");
      return;
    }
    
    // Transform backend format to frontend format
    const phrase: Phrase = {
      id: exercise.number,          // Use number as local ID
      level: exercise.difficulty,
      text: exercise.text,
      syllables: exercise.syllables,
      audioFile: exercise.audioFile,
      wordTimings: exercise.wordTimings
    };
    
    setCurrentPhrase(phrase);
  } catch (err) {
    setError("Erro ao carregar exercício");
  } finally {
    setIsLoading(false);
  }
}
```

#### Step 2: Track Completion

**Add this when playback finishes:**
```typescript
useEffect(() => {
  if (isPlaybackStarted && !highlight.isPlaying && !wordHighlight.isPlaying) {
    setHasFinishedPlayback(true);
    setIsPlaybackStarted(false);
    
    // ✨ NEW: Mark as complete in database
    if (currentPhrase) {
      markReadingExerciseComplete(userId, exerciseId, difficulty);
      setCompletedExercises(prev => new Set(Array.from(prev).concat(currentPhrase.id)));
    }
  }
}, [highlight.isPlaying, wordHighlight.isPlaying, isPlaybackStarted, currentPhrase]);
```

#### Step 3: Load Progress Dots

**On mount and difficulty change:**
```typescript
useEffect(() => {
  async function loadProgress() {
    const completed = await getCompletedExerciseIds(userId, difficulty);
    // Transform UUIDs to numbers
    const completedNumbers = await mapUUIDsToNumbers(completed);
    setCompletedExercises(new Set(completedNumbers));
  }
  loadProgress();
}, [difficulty]);
```

#### Step 4: Reset Button

**Update restart handler:**
```typescript
onClick={async () => {
  await resetReadingProgress(userId, difficulty);
  setCompletedExercises(new Set());
  loadNextPhrase(); // Starts from exercise #1
}}
```

---

## Edge Cases Handled

### 1. **No Exercises Left**
**Scenario:** Student completed all exercises at a difficulty  
**Backend:** `getNextReadingExercise()` returns `null`  
**Frontend Action:** Show completion message

```typescript
if (!exercise) {
  setError("🎉 Completaste todos os exercícios neste nível!");
  return;
}
```

### 2. **Switching Difficulty Mid-Session**
**Scenario:** User changes difficulty selector  
**Backend:** Each difficulty has independent progress  
**Frontend:** Clear local state, load fresh progress

```typescript
function handleDifficultyChange(newDifficulty: Difficulty) {
  setDifficulty(newDifficulty);
  setCompletedExercises(new Set()); // Clear local state
  loadProgressForDifficulty(newDifficulty); // Load from DB
}
```

### 3. **Page Refresh**
**Scenario:** User refreshes browser  
**Backend:** Progress persisted in database  
**Frontend:** Reload from `reading_progress` table

```typescript
useEffect(() => {
  // On mount: restore progress from database
  loadProgress();
  loadNextPhrase();
}, []);
```

### 4. **Duplicate Completion**
**Scenario:** User clicks "Próxima Frase" multiple times quickly  
**Backend:** `UNIQUE (student_id, exercise_id)` constraint prevents duplicates  
**Frontend:** No action needed (backend handles it)

### 5. **Network Failure**
**Scenario:** API call fails mid-session  
**Backend:** Returns `{ success: false, error: "message" }`  
**Frontend:** Show error, allow retry

```typescript
const result = await markReadingExerciseComplete(...);
if (!result.success) {
  setError("Erro ao guardar progresso. Tenta novamente.");
}
```

### 6. **Audio File Missing**
**Scenario:** `audioFile` path doesn't exist  
**Backend:** Doesn't validate audio files (frontend responsibility)  
**Frontend:** Already handles with error catching in `Audio()` constructor

---

## Migration Path

### Phase 1: Database Setup ✅
1. Run `supabase-reading-mode-schema.sql` in Supabase SQL Editor
2. Run `supabase-reading-mode-seed.sql` to populate exercises
3. Verify with: `SELECT difficulty, COUNT(*) FROM reading_exercises GROUP BY difficulty;`

### Phase 2: Backend Functions ✅
1. Add types to `types/exercises.ts`
2. Add functions to `lib/readingMode.ts`
3. Test with manual calls in browser console

### Phase 3: Frontend Integration (Next Step)
1. Replace `loadNextPhrase()` with database call
2. Add `markReadingExerciseComplete()` on playback finish
3. Load progress dots from `getCompletedExerciseIds()`
4. Update reset button to call `resetReadingProgress()`

### Phase 4: Metrics (Optional)
1. Add metrics tracking to component (time, playback count)
2. Call `insertReadingMetrics()` on exercise completion
3. Build analytics dashboard using `getReadingMetrics()`

---

## Database Queries Reference

### Get Next Exercise (RPC)
```sql
SELECT * FROM get_next_reading_exercise(
  'user-uuid',
  'easy'
);
```

### Check Progress
```sql
SELECT COUNT(*) as completed
FROM reading_progress
WHERE student_id = 'user-uuid'
  AND difficulty = 'easy';
```

### Reset Progress
```sql
SELECT reset_reading_progress(
  'user-uuid',
  'easy'
);
```

---

## Testing Checklist

### Backend Tests
- [ ] `getNextReadingExercise()` returns exercises in order (1, 2, 3...)
- [ ] `getNextReadingExercise()` excludes completed exercises
- [ ] `getNextReadingExercise()` returns `null` when all done
- [ ] `markReadingExerciseComplete()` is idempotent (no duplicates)
- [ ] `resetReadingProgress()` clears all progress for difficulty
- [ ] Progress is isolated per student (student A can't see student B)
- [ ] RLS policies prevent unauthorized access

### Frontend Integration Tests
- [ ] Progress dots show correctly on page load
- [ ] Progress persists after page refresh
- [ ] Switching difficulty loads correct exercises
- [ ] Reset button clears progress and restarts
- [ ] "Próxima Frase" button shows next sequential exercise
- [ ] Completed exercises have green dots
- [ ] Current exercise has highlighted dot
- [ ] All exercises completed shows message

### Edge Case Tests
- [ ] Network failure gracefully handled
- [ ] Rapid button clicks don't create duplicate progress
- [ ] Invalid student ID returns error
- [ ] Missing exercise ID returns error
- [ ] Audio file path preserved correctly

---

## Performance Considerations

### Indexes
✅ All critical indexes created:
- `idx_reading_exercises_difficulty_number` → Fast exercise lookup
- `idx_reading_progress_student_difficulty` → Fast progress queries
- `idx_reading_metrics_student_difficulty` → Fast analytics

### Caching Strategy (Future)
- Cache exercises list per difficulty (rarely changes)
- Invalidate on admin content updates
- Progress must always be fresh (don't cache)

### Metrics Optimization
- Batch metric inserts if tracking multiple events
- Use background job for heavy analytics queries
- Consider aggregation tables for dashboard (future)

---

## Future Enhancements

### Planned Features
1. **Reading Comprehension Questions**
   - Add `questions` JSONB field to exercises
   - Track accuracy in metrics
   
2. **Adaptive Difficulty**
   - Auto-suggest difficulty based on performance
   - Use metrics to identify struggling students

3. **Word-Level Audio**
   - Add `word_audio_files` JSONB to exercises
   - Replace frontend-generated paths with DB references

4. **Profissional Dashboard**
   - View student progress across difficulties
   - Identify students needing help
   - Export progress reports

### Schema Extensibility
The `session_data` JSONB field allows adding new metrics without migrations:
```typescript
sessionData: {
  word_clicks: ['palavra1', 'palavra2'],
  pauses: [{ timestamp: 15, duration: 3 }],
  custom_field: value
}
```

---

## Troubleshooting

### Common Issues

**Issue:** `getNextReadingExercise()` returns `null` but exercises exist
- **Check:** RLS policies - is user authenticated?
- **Check:** Progress table - are all exercises marked complete?
- **Fix:** `SELECT * FROM reading_progress WHERE student_id = 'uuid';`

**Issue:** Progress not saving
- **Check:** `auth.uid()` matches `student_id`
- **Check:** Foreign key constraints (exercise exists?)
- **Fix:** Check Supabase logs for RLS denials

**Issue:** Audio files not playing
- **Check:** Audio file paths in database match `/public/audios/` folder
- **Check:** File extensions (`.m4a` vs `.mp3`)
- **Fix:** Update `audio_file` paths in database

**Issue:** Duplicate progress entries
- **Should Not Happen:** `UNIQUE (student_id, exercise_id)` constraint
- **Check:** Is constraint applied? `\d reading_progress` in psql
- **Fix:** Re-run schema migration

---

## Security Considerations

### Row Level Security (RLS)
✅ All tables have RLS enabled:
- Students can only see/modify their own data
- Profissionais can view linked students' data
- No public access without authentication

### RPC Function Security
✅ All RPC functions use `SECURITY DEFINER`:
- Execute with elevated privileges
- Validate `auth.uid()` internally
- Prevent SQL injection via parameterized queries

### Input Validation
✅ All functions validate:
- Student ID not empty
- Difficulty in allowed values
- Foreign key references exist

---

## Contact & Support

**Maintainer:** Backend Engineer  
**Documentation:** [docs/READING_MODE_BACKEND.md](./READING_MODE_BACKEND.md)  
**Schema:** [database/supabase-reading-mode-schema.sql](../database/supabase-reading-mode-schema.sql)  
**Functions:** [lib/readingMode.ts](../lib/readingMode.ts)

---

**End of Documentation**
