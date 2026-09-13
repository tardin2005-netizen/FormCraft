import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFunctions, httpsCallable } from 'firebase/functions'
import app from '../firebase'
import { useLinksStore } from '../store/linksStore'
import { useAreasStore } from '../store/areasStore'
import { useSavedToolsStore } from '../store/savedToolsStore'
import s from './FormCraftChat.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const functions = getFunctions(app, 'us-central1')
const chatFn = httpsCallable<
  { messages: ChatMessage[]; context?: object },
  { answer: string }
>(functions, 'chatFormCraft')

const STARTERS = [
  'O que é posicionamento de marca?',
  'Como calcular o CAC do meu negócio?',
  'Crie um plano de conteúdo para Instagram',
  'Explique a matriz BCG com exemplos',
  'Como melhorar a taxa de conversão do meu site?',
]

export default function FormCraftChat({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const { links }         = useLinksStore()
  const { areas }         = useAreasStore()
  const { saved: savedToolNames } = useSavedToolsStore()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function buildContext() {
    const recentLinks = [...links]
      .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
      .slice(0, 10)
      .map(l => ({ title: l.title, url: l.url, type: l.type }))

    return {
      recentLinks,
      savedTools: savedToolNames,
      currentArea: areas[0]?.title,
    }
  }

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: ChatMessage = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const context = buildContext()
      const result = await chatFn({ messages: newMessages, context })
      setMessages(prev => [...prev, { role: 'assistant', content: result.data.answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function clearChat() {
    setMessages([])
    setInput('')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={s.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={s.panel}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            {/* Header */}
            <div className={s.header}>
              <div className={s.headerLeft}>
                <span className={s.headerIcon}>⬡</span>
                <div>
                  <div className={s.headerTitle}>FormCraft AI</div>
                  <div className={s.headerSub}>Estrategista · Analista · Professor</div>
                </div>
              </div>
              <div className={s.headerActions}>
                {messages.length > 0 && (
                  <button className={s.clearBtn} onClick={clearChat} title="Limpar conversa">
                    ↺
                  </button>
                )}
                <button className={s.closeBtn} onClick={onClose} title="Fechar (Esc)">✕</button>
              </div>
            </div>

            {/* Messages */}
            <div className={s.messages}>
              {messages.length === 0 ? (
                <div className={s.empty}>
                  <div className={s.emptyIcon}>⬡</div>
                  <div className={s.emptyTitle}>FormCraft AI</div>
                  <div className={s.emptyDesc}>
                    Seu assistente de Marketing, Estratégia e Negócios. Faça uma pergunta ou escolha um ponto de partida:
                  </div>
                  <div className={s.starters}>
                    {STARTERS.map(s2 => (
                      <button key={s2} className={s.starterBtn} onClick={() => send(s2)}>
                        {s2}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`${s.msg} ${msg.role === 'user' ? s.msgUser : s.msgAi}`}>
                    {msg.role === 'assistant' && (
                      <span className={s.aiAvatar}>⬡</span>
                    )}
                    <div className={s.msgBubble}>
                      <MessageContent content={msg.content} />
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className={`${s.msg} ${s.msgAi}`}>
                  <span className={s.aiAvatar}>⬡</span>
                  <div className={`${s.msgBubble} ${s.thinking}`}>
                    <span className={s.dot} />
                    <span className={s.dot} />
                    <span className={s.dot} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className={s.inputArea}>
              <textarea
                ref={inputRef}
                className={s.textarea}
                placeholder="Pergunte sobre Marketing, Estratégia, UX, Negócios..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={loading}
              />
              <button
                className={s.sendBtn}
                onClick={() => send()}
                disabled={!input.trim() || loading}
                title="Enviar (Enter)"
              >
                ↑
              </button>
            </div>
            <div className={s.inputHint}>Enter para enviar · Shift+Enter para quebrar linha</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className={s.msgText}>
      {lines.map((line, i) => {
        if (line.startsWith('# '))  return <h3 key={i} className={s.h3}>{line.slice(2)}</h3>
        if (line.startsWith('## ')) return <h4 key={i} className={s.h4}>{line.slice(3)}</h4>
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={i}>{line.slice(2, -2)}</strong>
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <div key={i} className={s.bullet}>· {line.slice(2)}</div>
        }
        if (line.match(/^\d+\. /)) {
          return <div key={i} className={s.bullet}>{line}</div>
        }
        if (line.trim() === '') return <div key={i} className={s.spacer} />
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}
