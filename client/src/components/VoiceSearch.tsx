import { useState, useRef } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import app from '../firebase'
import { ALL_TOOLS } from '../data/tools'
import s from './VoiceSearch.module.css'

interface Props {
  onToolClick?: (url: string) => void
}

type State = 'idle' | 'listening' | 'thinking' | 'result' | 'error'

const functions = getFunctions(app, 'us-central1')
const askClaudeFn = httpsCallable<{ question: string; tools: { name: string; cat: string; desc: string }[] }, { answer: string }>(
  functions,
  'askClaude'
)

export default function VoiceSearch({ onToolClick }: Props) {
  const [state, setState] = useState<State>('idle')
  const [transcript, setTranscript] = useState('')
  const [answer, setAnswer] = useState('')
  const [mentioned, setMentioned] = useState<typeof ALL_TOOLS>([])
  const recRef = useRef<any>(null)

  function startListening() {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) {
      setAnswer('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.')
      setState('error')
      return
    }
    const rec = new SR()
    rec.lang = 'pt-BR'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recRef.current = rec

    rec.onstart  = () => setState('listening')
    rec.onerror  = () => { setState('error'); setAnswer('Erro ao acessar o microfone.') }
    rec.onend    = () => { /* handled by onresult */ }
    rec.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript
      setTranscript(text)
      askClaude(text)
    }
    rec.start()
  }

  function stopListening() {
    recRef.current?.stop()
    setState('idle')
  }

  async function askClaude(question: string) {
    setState('thinking')
    try {
      const tools = ALL_TOOLS.map(t => ({ name: t.name, cat: t.cat, desc: t.desc }))
      const result = await askClaudeFn({ question, tools })
      const text = result.data.answer
      setAnswer(text)
      const hits = ALL_TOOLS.filter(t => text.toLowerCase().includes(t.name.toLowerCase()))
      setMentioned(hits)
      setState('result')
    } catch {
      setAnswer('Não foi possível conectar ao servidor de IA. Tente novamente.')
      setState('error')
    }
  }

  function reset() {
    setState('idle')
    setTranscript('')
    setAnswer('')
    setMentioned([])
  }

  return (
    <div className={s.wrap}>
      {(state === 'idle' || state === 'error') && (
        <button
          className={`${s.micBtn} ${state === 'error' ? s.micError : ''}`}
          onClick={startListening}
          title="Buscar por voz"
        >
          🎤
        </button>
      )}

      {state === 'listening' && (
        <button className={`${s.micBtn} ${s.micActive}`} onClick={stopListening} title="Parar">
          <span className={s.pulse} />
          🎤
        </button>
      )}

      {state === 'thinking' && (
        <button className={`${s.micBtn} ${s.micThinking}`} disabled title="Processando...">
          ⟳
        </button>
      )}

      {(state === 'result' || state === 'error') && transcript && (
        <div className={s.panel}>
          <div className={s.transcriptRow}>
            <span className={s.transcriptLabel}>Você disse:</span>
            <span className={s.transcriptText}>"{transcript}"</span>
            <button className={s.resetBtn} onClick={reset} title="Nova busca">✕</button>
          </div>

          <div className={s.answerText}>{answer}</div>

          {mentioned.length > 0 && (
            <div className={s.toolChips}>
              {mentioned.map(t => (
                <a
                  key={t.name}
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className={s.toolChip}
                  style={{ borderColor: t.color + '55', background: t.color + '18' }}
                  onClick={() => onToolClick?.(t.url)}
                >
                  <span className={s.toolChipLetter} style={{ background: t.color }}>{t.letter}</span>
                  {t.name}
                </a>
              ))}
            </div>
          )}

          <button className={s.newSearch} onClick={() => { reset(); startListening() }}>
            🎤 Nova busca por voz
          </button>
        </div>
      )}
    </div>
  )
}
