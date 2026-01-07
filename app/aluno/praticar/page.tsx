"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Play, Pause, SkipForward, Settings, Volume2, CheckCircle2, XCircle, RefreshCw, Key } from "lucide-react";
import { SyllableDivider } from "@/lib/logic/SyllableDivider";
import { PHRASES, getRandomPhrase, getPhrasesByLevel } from "@/lib/phrases";
import type { Phrase } from "@/types/exercises";

// Character Component ported from CSS
const DiscoveryCharacter = () => (
  <div className="relative w-[120px] h-[120px] mx-auto">
    <div className="absolute top-[-15px] left-[47px] w-[25px] h-[25px] bg-[#2d2d2d] rounded-full"></div>
    <div className="absolute top-[-5px] left-[22px] w-[75px] h-[35px] bg-[#2d2d2d] rounded-t-[50px]"></div>
    <div className="absolute top-0 left-[25px] w-[70px] h-[60px] bg-gradient-to-b from-[#FFCC80] to-[#FFB74D] rounded-full">
      <div className="absolute top-[22px] left-[8px] flex gap-[4px]">
        <div className="w-[18px] h-[14px] border-2 border-[#5d4037] rounded-[3px] bg-white/30"></div>
        <div className="w-[6px] h-[2px] bg-[#5d4037] mt-[6px]"></div>
        <div className="w-[18px] h-[14px] border-2 border-[#5d4037] rounded-[3px] bg-white/30"></div>
      </div>
      <div className="absolute top-[40px] left-[27px] w-[15px] h-[8px] border-b-2 border-r-2 border-l-2 border-[#5d4037] rounded-b-[15px]"></div>
    </div>
    <div className="absolute bottom-0 left-[10px] w-[100px] h-[80px] bg-gradient-to-b from-[#FFA726] to-[#FB8C00] rounded-t-[20px] rounded-b-[40px]">
      <div className="absolute top-[8px] left-[40px] w-[20px] h-[12px] bg-white rounded-full"></div>
    </div>
  </div>
);

type DiffOp = {
  op: 'match' | 'replace' | 'delete' | 'insert';
  expected?: string;
  typed?: string;
};

export default function PraticarPage() {
  const router = useRouter();
  
  // App State
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [userInput, setUserInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    ops: DiffOp[];
    isCorrect: boolean;
    stats: {
      correct: number;
      total: number;
      wrong: number;
      missing: number;
      extra: number;
      pct: number;
    };
  } | null>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Settings
  const [checkAccents, setCheckAccents] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [ignorePunct, setIgnorePunct] = useState(true);

  // Progress tracking
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // Load initial phrase
  useEffect(() => {
    loadNewPhrase();
    return () => {
      stopAudio();
    };
  }, []);

  const loadNewPhrase = () => {
    const phrasesForLevel = getPhrasesByLevel(difficulty);
    
    // Find next phrase in sequence
    let nextIndex = 0;
    if (currentPhrase) {
      const currentIndex = phrasesForLevel.findIndex(p => p.id === currentPhrase.id);
      if (currentIndex >= 0 && currentIndex < phrasesForLevel.length - 1) {
        nextIndex = currentIndex + 1;
      } else {
        nextIndex = 0; // Loop back
      }
    }
    
    const phrase = phrasesForLevel[nextIndex];
    setCurrentPhrase(phrase);
    setCurrentPhraseIndex(nextIndex);
    setUserInput("");
    setShowResult(false);
    setResult(null);
    audioBufferRef.current = null;
    stopAudio();
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async (speed = 1.0) => {
    if (!currentPhrase) return;
    
    stopAudio();
    
    // Use local audio file if available
    if (currentPhrase.audioFile) {
      setAudioLoading(true);
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const response = await fetch(currentPhrase.audioFile);
        if (!response.ok) throw new Error('Falha ao carregar áudio');
        
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
      } catch (err) {
        console.error('Audio error:', err);
        alert('Erro ao carregar áudio. Verifica a tua ligação.');
        setAudioLoading(false);
        return;
      } finally {
        setAudioLoading(false);
      }
    } else {
      // Fallback to ElevenLabs API if no local file
      if (!audioBufferRef.current) {
        setAudioLoading(true);
        try {
          const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
          const voiceId = process.env.NEXT_PUBLIC_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
          
          if (!apiKey) {
            throw new Error('Configuração de áudio em falta');
          }

          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': apiKey,
            },
            body: JSON.stringify({
              text: currentPhrase.text,
              model_id: 'eleven_turbo_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              }
            }),
          });

          if (!response.ok) throw new Error('Falha ao gerar áudio');
        
          const arrayBuffer = await response.arrayBuffer();
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          
          audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        } catch (err) {
          console.error('Audio error:', err);
          alert('Erro ao carregar áudio. Verifica a tua ligação.');
          setAudioLoading(false);
          return;
        } finally {
          setAudioLoading(false);
        }
      }
    }

    if (audioContextRef.current && audioBufferRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.playbackRate.value = speed;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  const sanitize = (text: string, forDisplay = false) => {
    let s = (text ?? '').trim();
    if (!forDisplay) {
      if (ignoreCase) s = s.toLowerCase();
      if (ignorePunct) {
        s = s.replace(/[.,!?;:\"\"''´`(){}\[\]<>«»]/g, '');
        s = s.replace(/[-–—]/g, '');
      }
      if (!checkAccents) {
        s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
    }
    return s.replace(/\s+/g, ' ').trim();
  };

  const getSyllables = (text: string) => {
    return SyllableDivider.split(text).filter(s => s.trim());
  };

  const diffSyllables = (expected: string[], typed: string[]) => {
    const m = expected.length;
    const n = typed.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const expSyl = sanitize(expected[i - 1]);
        const typSyl = sanitize(typed[j - 1]);
        const cost = expSyl === typSyl ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    
    let i = m, j = n;
    const ops: DiffOp[] = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        const expSyl = sanitize(expected[i - 1]);
        const typSyl = sanitize(typed[j - 1]);
        const cost = expSyl === typSyl ? 0 : 1;
        if (dp[i][j] === dp[i - 1][j - 1] + cost) {
          ops.push({
            op: cost === 0 ? 'match' : 'replace',
            expected: expected[i - 1],
            typed: typed[j - 1]
          });
          i--; j--; continue;
        }
      }
      if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        ops.push({ op: 'delete', expected: expected[i - 1] });
        i--; continue;
      }
      ops.push({ op: 'insert', typed: typed[j - 1] });
      j--;
    }
    return { ops: ops.reverse(), distance: dp[m][n] };
  };

  const handleCheckText = (text: string) => {
    if (!currentPhrase || !text.trim()) return;
    
    const expectedSyls = getSyllables(currentPhrase.text);
    const typedSyls = getSyllables(text);
    
    const { ops, distance } = diffSyllables(expectedSyls, typedSyls);
    
    let correct = 0, wrong = 0, missing = 0, extra = 0;
    ops.forEach(o => {
      if (o.op === 'match') correct++;
      else if (o.op === 'replace') wrong++;
      else if (o.op === 'delete') missing++;
      else if (o.op === 'insert') extra++;
    });
    
    const total = expectedSyls.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    setResult({
      ops,
      isCorrect: distance === 0,
      stats: { correct, total, wrong, missing, extra, pct }
    });
    setShowResult(true);
    
    // Mark as completed if correct
    if (distance === 0 && currentPhrase) {
      setCompletedExercises(prev => new Set(Array.from(prev).concat(currentPhrase.id)));
    }
  };

  const handleCheck = () => {
    handleCheckText(userInput);
  };

  const handleSkip = () => {
    if (!currentPhrase) return;
    setUserInput(currentPhrase.text);
    handleCheckText(currentPhrase.text);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurações do Ditado</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                    <Button
                      key={lvl}
                      variant={difficulty === lvl ? "default" : "outline"}
                      size="sm"
                      className="flex-1 capitalize"
                      onClick={() => {
                        setDifficulty(lvl);
                        // We'll load new phrase on close or immediately
                      }}
                    >
                      {lvl === 'easy' ? 'Fácil' : lvl === 'medium' ? 'Médio' : 'Difícil'}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verificar acentos</span>
                  <input type="checkbox" checked={checkAccents} onChange={(e) => setCheckAccents(e.target.checked)} className="h-5 w-5 accent-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ignorar maiúsculas</span>
                  <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="h-5 w-5 accent-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ignorar pontuação</span>
                  <input type="checkbox" checked={ignorePunct} onChange={(e) => setIgnorePunct(e.target.checked)} className="h-5 w-5 accent-green-600" />
                </div>
              </div>
              
              <Button className="w-full" onClick={() => { loadNewPhrase(); }}>
                Nova Frase
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {getPhrasesByLevel(difficulty).map((phrase, i) => (
            <div 
              key={phrase.id} 
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                completedExercises.has(phrase.id)
                  ? 'bg-[#58CC02]'
                  : phrase.id === currentPhrase?.id
                  ? 'bg-[#58CC02] ring-2 ring-[#58CC02]/50'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content Card - Centered */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <Card className="w-full max-w-2xl bg-white shadow-lg border-2 border-gray-200">
            <CardContent className="p-8">
              {/* Small phrase text at top with refresh icon */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 text-base">{currentPhrase?.text}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadNewPhrase}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Large phrase display */}
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
                  {currentPhrase?.text}
                </h2>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom buttons section */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            onClick={() => playAudio(1.0)}
            disabled={audioLoading}
            size="lg"
            className="bg-[#FFC800] hover:bg-[#FFD700] text-gray-900 font-bold text-lg px-12 py-6 rounded-2xl shadow-md border-b-4 border-[#E5A800] active:border-b-0 active:translate-y-[2px] transition-all"
          >
            <Play className="h-6 w-6 mr-3" />
            Reproduzir
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="text-gray-400 hover:text-gray-600 font-bold px-8 py-6"
          >
            <SkipForward className="h-6 w-6 mr-2" />
            Próxima Frase
          </Button>
        </div>

        {/* Difficulty indicator */}
        <div className="text-center text-sm text-gray-500">
          <p>Nível: <span className="font-semibold">Easy</span></p>
          <p className="text-xs text-gray-400 mt-1">
            Clica em "Reproduzir" para ouvir a frase com destaque visual
          </p>
        </div>
      </main>

      {/* Result Panel */}
      {showResult && result && (
        <div className={`fixed bottom-0 left-0 right-0 p-8 transition-transform duration-300 translate-y-0 z-50 ${
          result.isCorrect ? 'bg-[#d7ffb8] border-t-2 border-[#58cc02]' : 'bg-[#ffdfe0] border-t-2 border-[#ff4b4b]'
        }`}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm ${
                result.isCorrect ? 'bg-[#58cc02]' : 'bg-[#ff4b4b]'
              }`}>
                {result.isCorrect ? '✓' : '✗'}
              </div>
              <h3 className={`text-2xl font-bold ${
                result.isCorrect ? 'text-[#58a700]' : 'text-[#ea2b2b]'
              }`}>
                {result.isCorrect ? 'Excelente!' : 'Quase!'}
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">O QUE ESCREVESTE:</p>
                <div className="flex flex-wrap gap-1 text-lg font-bold" style={{ fontFamily: "'OpenDyslexic', sans-serif" }}>
                  {result.ops.map((op, idx) => (
                    <span key={idx} className={`px-1.5 py-0.5 rounded ${
                      op.op === 'match' ? 'bg-[#58cc0226] text-[#58a700]' :
                      op.op === 'replace' ? 'bg-[#ff4b4b26] text-[#ea2b2b] line-through' :
                      op.op === 'delete' ? 'bg-[#ff4b4b26] text-[#ea2b2b]' :
                      'bg-[#ff980026] text-[#e65100] line-through'
                    }`}>
                      {op.typed || '·'}
                    </span>
                  ))}
                </div>
              </div>

              {!result.isCorrect && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">CORRETO:</p>
                  <div className="flex flex-wrap gap-1 text-lg font-bold" style={{ fontFamily: "'OpenDyslexic', sans-serif" }}>
                    {result.ops.map((op, idx) => (
                      <span key={idx} className={`px-1.5 py-0.5 rounded ${
                        op.op === 'match' ? 'bg-[#58cc0226] text-[#58a700]' :
                        'bg-[#ff4b4b26] text-[#ea2b2b] underline decoration-2'
                      }`}>
                        {op.expected || '·'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium mb-6">
              <span className="flex items-center gap-1">✓ {result.stats.correct}/{result.stats.total} sílabas</span>
              <span className="flex items-center gap-1">{result.stats.pct}% correto</span>
              {result.stats.wrong > 0 && <span>✗ {result.stats.wrong} erradas</span>}
              {result.stats.missing > 0 && <span>⚠ {result.stats.missing} a faltar</span>}
              {result.stats.extra > 0 && <span>+ {result.stats.extra} a mais</span>}
            </div>

            <Button
              onClick={() => {
                if (result.isCorrect) loadNewPhrase();
                else setShowResult(false);
              }}
              className={`w-full py-6 text-lg font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all ${
                result.isCorrect 
                  ? 'bg-[#58cc02] hover:bg-[#61d800] border-b-4 border-[#58a700]' 
                  : 'bg-[#ff4b4b] hover:bg-[#ff5f5f] border-b-4 border-[#ea2b2b]'
              }`}
            >
              CONTINUAR
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
