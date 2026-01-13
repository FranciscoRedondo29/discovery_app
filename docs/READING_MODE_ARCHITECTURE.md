# Reading Mode: Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Existing)                        │
│                     app/aluno/learning/page.tsx                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  State:                                                             │
│  ├─ difficulty: 'easy' | 'medium' | 'hard'                         │
│  ├─ currentPhrase: Phrase | null                                   │
│  ├─ completedExercises: Set<number>  (progress dots)               │
│  └─ hasFinishedPlayback: boolean                                   │
│                                                                     │
│  UI Components:                                                     │
│  ├─ Difficulty Selector  [Fácil] [Médio] [Difícil]                │
│  ├─ Progress Dots        ●●●○○○○○○○○ (green = done)                │
│  ├─ Phrase Card          "A lua."                                  │
│  ├─ Controls             [▶ Reproduzir] [→ Próxima Frase]          │
│  └─ Settings             Speed: 1.0x, Syllables: OFF               │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ API Calls (lib/readingMode.ts)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND FUNCTIONS                            │
│                        lib/readingMode.ts                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Exercise Fetching:                                                 │
│  ├─ getNextReadingExercise(userId, difficulty)                     │
│  │   → Returns: Next uncompleted exercise in sequence              │
│  │   → Logic: MIN(number) WHERE NOT IN completed                   │
│  │                                                                  │
│  ├─ getAllReadingExercises(difficulty)                             │
│  │   → Returns: All exercises for progress dots                    │
│  │   → Ordered by: number ASC                                      │
│  │                                                                  │
│  └─ getReadingExerciseById(exerciseId)                             │
│      → Returns: Specific exercise (for replay)                     │
│                                                                     │
│  Progress Tracking:                                                 │
│  ├─ markReadingExerciseComplete(userId, exerciseId, difficulty)    │
│  │   → Creates: reading_progress entry                             │
│  │   → Idempotent: Won't create duplicates                         │
│  │                                                                  │
│  ├─ getCompletedExerciseIds(userId, difficulty)                    │
│  │   → Returns: [uuid1, uuid2, uuid3]                              │
│  │   → Used for: Rendering progress dots                           │
│  │                                                                  │
│  ├─ getReadingProgressSummary(userId, difficulty)                  │
│  │   → Returns: {total: 11, completed: 3, percent: 27.27}          │
│  │   → Used for: Analytics dashboard                               │
│  │                                                                  │
│  └─ resetReadingProgress(userId, difficulty)                       │
│      → Deletes: All progress for difficulty                        │
│      → Used by: Restart button                                     │
│                                                                     │
│  Metrics & Analytics:                                               │
│  ├─ insertReadingMetrics(metrics)                                  │
│  │   → Stores: playbackCount, timeSpent, speed, etc.               │
│  │   → Optional: For analytics only                                │
│  │                                                                  │
│  └─ completeReadingExercise(userId, exerciseId, difficulty, ...)   │
│      → Combined: Mark complete + store metrics                     │
│      → Recommended: Single call instead of two                     │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Supabase Client
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE (PostgreSQL)                        │
│                            Supabase                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ reading_exercises                                           │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ id (UUID)              | "550e8400-e29b-41d4-a716-..."      │   │
│  │ number (INT)           | 1, 2, 3, 4, 5...                   │   │
│  │ difficulty (TEXT)      | 'easy' | 'medium' | 'hard'         │   │
│  │ text (TEXT)            | "A lua."                           │   │
│  │ audio_file (TEXT)      | "/audios/A lua.m4a"                │   │
│  │ word_timings (JSONB)   | [{word:"A",start:0,end:1}, ...]    │   │
│  │ syllables (TEXT)       | "A lu-a."                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│                             │ Foreign Key                           │
│  ┌──────────────────────────┴──────────────────────────────────┐   │
│  │ reading_progress                                            │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ id (UUID)              | Auto-generated                     │   │
│  │ student_id (UUID)      | → alunos.id                        │   │
│  │ exercise_id (UUID)     | → reading_exercises.id             │   │
│  │ difficulty (TEXT)      | 'easy' | 'medium' | 'hard'         │   │
│  │ completed_at (TS)      | 2026-01-13 10:30:00                │   │
│  │                                                             │   │
│  │ UNIQUE (student_id, exercise_id)  ← Prevents duplicates    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ reading_metrics (Optional - for analytics)                  │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ id (UUID)              | Auto-generated                     │   │
│  │ student_id (UUID)      | → alunos.id                        │   │
│  │ exercise_id (UUID)     | → reading_exercises.id             │   │
│  │ playback_count (INT)   | 2 (clicked "Reproduzir" twice)     │   │
│  │ time_spent_seconds     | 45 (seconds on exercise)           │   │
│  │ playback_speed (DEC)   | 1.0 (speed setting)                │   │
│  │ syllable_mode_used     | false                              │   │
│  │ session_data (JSONB)   | {...} flexible storage             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  RPC Functions (Postgres Functions):                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ get_next_reading_exercise(student_id, difficulty)           │   │
│  │ → Returns first exercise WHERE NOT IN progress              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ get_reading_progress_summary(student_id, difficulty)        │   │
│  │ → Returns aggregate stats (total, completed, percent)       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ reset_reading_progress(student_id, difficulty)              │   │
│  │ → Deletes all progress entries for difficulty               │   │
│  │ → Security: Checks auth.uid() === student_id                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Row Level Security (RLS):                                          │
│  ✅ Students can only see/modify their own data                     │
│  ✅ Profissionais can view linked students                          │
│  ✅ No public access without authentication                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### 1. Loading Next Exercise

```
User clicks "Próxima Frase"
   │
   ▼
Frontend: loadNextPhrase()
   │
   ▼
Backend: getNextReadingExercise(userId, 'easy')
   │
   ▼
Database: 
   SELECT * FROM reading_exercises
   WHERE difficulty = 'easy'
     AND id NOT IN (
       SELECT exercise_id FROM reading_progress
       WHERE student_id = userId
     )
   ORDER BY number ASC
   LIMIT 1
   │
   ▼
Backend: Transform to Phrase format
   │
   ▼
Frontend: Display exercise
```

### 2. Marking Complete

```
Playback finishes
   │
   ▼
Frontend: markReadingExerciseComplete(userId, exerciseId, 'easy')
   │
   ▼
Backend: Check for duplicates
   │
   ▼
Database:
   INSERT INTO reading_progress (student_id, exercise_id, difficulty)
   VALUES (userId, exerciseId, 'easy')
   ON CONFLICT (student_id, exercise_id) DO NOTHING
   │
   ▼
Frontend: Update progress dot to green
```

### 3. Loading Progress Dots

```
Page loads
   │
   ▼
Frontend: getCompletedExerciseIds(userId, 'easy')
   │
   ▼
Database:
   SELECT exercise_id FROM reading_progress
   WHERE student_id = userId AND difficulty = 'easy'
   │
   ▼
Backend: Returns ["uuid1", "uuid2", "uuid3"]
   │
   ▼
Frontend: Map UUIDs to numbers → Set([1, 2, 3])
   │
   ▼
Frontend: Render dots (green if in set)
```

### 4. Switching Difficulty

```
User clicks [Médio]
   │
   ▼
Frontend: handleDifficultyChange('medium')
   │
   ├─> Clear local state: setCompletedExercises(new Set())
   │
   ├─> Load progress: getCompletedExerciseIds(userId, 'medium')
   │
   └─> Load first exercise: getNextReadingExercise(userId, 'medium')
```

---

## Key Contracts (Frontend ↔ Backend)

### Frontend Expects:
```typescript
{
  id: number,              // Sequential (1, 2, 3...)
  level: 'easy' | 'medium' | 'hard',
  text: string,
  audioFile: string,
  wordTimings: [{word, start, end}, ...],
  syllables?: string
}
```

### Backend Returns:
```typescript
{
  id: string,              // UUID (database ID)
  number: number,          // Sequential (1, 2, 3...)
  difficulty: 'easy' | 'medium' | 'hard',
  text: string,
  audioFile: string,
  wordTimings: [{word, start, end}, ...],
  syllables?: string
}
```

### Transformation:
```typescript
const phrase = {
  id: exercise.number,     // Use number for UI
  level: exercise.difficulty,
  text: exercise.text,
  audioFile: exercise.audioFile,
  wordTimings: exercise.wordTimings,
  syllables: exercise.syllables
};

// Store UUID separately for API calls
exerciseMap.set(exercise.number, exercise.id);
```

---

## State Machine

```
┌─────────────┐
│   Initial   │
│  (no data)  │
└──────┬──────┘
       │
       │ Mount / userId ready
       ▼
┌─────────────┐
│   Loading   │  ← isLoading = true
│  Progress   │
└──────┬──────┘
       │
       │ getCompletedExerciseIds()
       ▼
┌─────────────┐
│   Loading   │
│  Exercise   │
└──────┬──────┘
       │
       │ getNextReadingExercise()
       ▼
┌─────────────┐
│    Ready    │  ← Exercise displayed
│ (can play)  │
└──────┬──────┘
       │
       │ User clicks "Reproduzir"
       ▼
┌─────────────┐
│   Playing   │  ← isPlaying = true
│             │     (buttons disabled)
└──────┬──────┘
       │
       │ Playback finishes
       ▼
┌─────────────┐
│  Completed  │  ← hasFinishedPlayback = true
│             │     markExerciseComplete()
└──────┬──────┘
       │
       │ User clicks "Próxima Frase"
       │
       └──> Back to "Loading Exercise"
```

---

## Database Indexes Performance

```sql
-- Optimized queries with indexes:

-- 1. Get next exercise (FAST)
EXPLAIN ANALYZE
SELECT * FROM reading_exercises
WHERE difficulty = 'easy'
  AND id NOT IN (SELECT exercise_id FROM reading_progress WHERE student_id = ?)
ORDER BY number ASC
LIMIT 1;
-- Uses: idx_reading_exercises_difficulty_number
-- Time: ~2ms

-- 2. Check progress (FAST)
EXPLAIN ANALYZE
SELECT exercise_id FROM reading_progress
WHERE student_id = ? AND difficulty = 'easy';
-- Uses: idx_reading_progress_student_difficulty
-- Time: ~1ms

-- 3. Get progress summary (FAST)
EXPLAIN ANALYZE
SELECT COUNT(*) FROM reading_exercises WHERE difficulty = 'easy';
-- Uses: idx_reading_exercises_difficulty_number
-- Time: ~1ms
```

---

**End of Diagram**
