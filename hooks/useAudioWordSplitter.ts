import { useState, useRef } from 'react'

/* =======================
   Tipos
======================= */

export interface AudioSegment {
  start: number
  duration: number
}

export interface PlaybackInfo {
  index: number
  palavra?: string
  start: number
  duration: number
}

/* =======================
   Hook
======================= */

export function useAudioWordSplitter() {
  const [palavras, setPalavras] = useState<string[]>([])
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([])
  const [audioFileName, setAudioFileName] = useState<string>('')
  const [segmentandoAudio, setSegmentandoAudio] = useState<boolean>(false)
  const [segmentError, setSegmentError] = useState<string>('')
  const [playbackInfo, setPlaybackInfo] = useState<PlaybackInfo | null>(null)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(null)
  const [silenceThreshold, setSilenceThreshold] = useState<number>(0.02)

  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const playbackPadding = 0.04

  /* =======================
     Utilidades
  ======================= */

  const extrairPalavras = (texto = ''): string[] =>
    texto
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
      .split(/\s+/)
      .filter(Boolean)

  const formatarTempo = (segundos: number): string => {
    const min = Math.floor(segundos / 60)
    const sec = segundos % 60
    return `${String(min).padStart(2, '0')}:${sec.toFixed(2).padStart(5, '0')}`
  }

  /* =======================
     Segmentação
  ======================= */

  const detectarSegmentosDeSilencio = (buffer: AudioBuffer): AudioSegment[] => {
    const canal = buffer.getChannelData(0)
    const taxa = buffer.sampleRate
    const minimoSilencio = Math.floor(taxa * 0.15)
    const segmentos: AudioSegment[] = []

    let inicio: number | null = null
    let contador = 0

    for (let i = 0; i < canal.length; i++) {
      if (Math.abs(canal[i]) > silenceThreshold) {
        if (inicio === null) inicio = i
        contador = 0
      } else if (inicio !== null) {
        contador++
        if (contador >= minimoSilencio) {
          const fim = i - contador
          const duracao = (fim - inicio) / taxa
          if (duracao > 0.1) {
            segmentos.push({
              start: inicio / taxa,
              duration: duracao
            })
          }
          inicio = null
        }
      }
    }

    return segmentos
  }

  /* =======================
     Áudio
  ======================= */

  const carregarAudio = async (file: File): Promise<void> => {
    if (!file) return

    setSegmentandoAudio(true)
    setSegmentError('')
    setAudioFileName(file.name)

    try {
      const reader = new FileReader()

      reader.onload = async () => {
        const ctx = new AudioContext()
        const buffer = await ctx.decodeAudioData(reader.result as ArrayBuffer)
        audioBufferRef.current = buffer

        const segmentos = detectarSegmentosDeSilencio(buffer)
        setAudioSegments(segmentos)

        const nomeBase = file.name.replace(/\.[^/.]+$/, '')
        setPalavras(extrairPalavras(nomeBase))

        setSegmentandoAudio(false)
        ctx.close()
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      console.error(err)
      setSegmentError('Erro ao processar o áudio.')
      setSegmentandoAudio(false)
    }
  }

  const tocarSegmento = (segment: AudioSegment, index: number): void => {
    if (!audioBufferRef.current) return

    // Parar reprodução anterior
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop()
      } catch (e) {
        // Já parado
      }
      audioSourceRef.current.disconnect()
      audioSourceRef.current = null
    }

    // Criar ou reutilizar AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    // Retomar se suspenso (iOS Safari)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBufferRef.current
    source.connect(audioContextRef.current.destination)

    const inicio = Math.max(0, segment.start - playbackPadding)
    const duracao = segment.duration + playbackPadding * 2

    // Handler para limpar quando terminar
    source.onended = () => {
      setPlaybackInfo(null)
      setCurrentSegmentIndex(null)
      audioSourceRef.current = null
    }

    source.start(0, inicio, duracao)
    audioSourceRef.current = source

    setPlaybackInfo({
      index,
      palavra: palavras[index],
      start: segment.start,
      duration: segment.duration
    })
    setCurrentSegmentIndex(index)
  }

  const tocarProximo = (): void => {
    if (currentSegmentIndex === null) return
    const prox = currentSegmentIndex + 1
    if (prox >= audioSegments.length) return
    tocarSegmento(audioSegments[prox], prox)
  }

  /* =======================
     API pública do hook
  ======================= */

  return {
    // estado
    palavras,
    audioSegments,
    audioFileName,
    segmentandoAudio,
    segmentError,
    playbackInfo,
    silenceThreshold,

    // setters
    setSilenceThreshold,

    // ações
    carregarAudio,
    tocarSegmento,
    tocarProximo,

    // utilidades
    formatarTempo
  }
}
