import { useState, useEffect, useRef } from 'react'
import s from './SearchPalette.module.css'

interface Props { onClose: () => void }

const BOT_RESPONSES: Record<string, string> = {
  ux: 'Encontrei 24 itens sobre UX & Design. Os mais recentes são sobre acessibilidade e sistemas de design.',
  design: 'Você tem 3 coleções relacionadas a design com 65 itens no total.',
  faculdade: 'Na área Faculdade há 31 itens, incluindo PDFs de metodologia e rascunhos do TCC.',
}

const GROUPS = [
  {
    label: 'Coleções',
    results: ['Referências de UI', 'Leituras de UX', 'Dev Tools'],
  },
  {
    label: 'Áreas',
    results: ['UX & Design', 'Desenvolvimento', 'Faculdade'],
  },
  {
    label: 'Conteúdos',
    results: ['Figma Handbook', 'Nielsen Heuristics.pdf', 'Ideias para o TCC', 'React Docs'],
  },
]

export default function SearchPalette({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => i + 1)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(0, i - 1))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const botKey = Object.keys(BOT_RESPONSES).find((k) =>
    query.toLowerCase().includes(k)
  )
  const botAnswer = query.length > 2 && botKey ? BOT_RESPONSES[botKey] : null

  let flatIndex = 0

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.palette} onClick={(e) => e.stopPropagation()}>
        <div className={s.inputRow}>
          <span className={s.searchIcon}>🔎</span>
          <input
            ref={inputRef}
            className={s.input}
            placeholder="Buscar em tudo... (⌘K para fechar)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className={s.esc} onClick={onClose}>Esc</kbd>
        </div>

        {botAnswer && (
          <div className={s.botAnswer}>
            <div className={s.botLabel}>🤖 FormCraft IA</div>
            <div className={s.botText}>{botAnswer}</div>
          </div>
        )}

        <div className={s.results}>
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className={s.groupLabel}>{g.label}</div>
              {g.results.map((r) => {
                const idx = flatIndex++
                return (
                  <div
                    key={r}
                    className={`${s.result} ${selectedIndex === idx ? s.resultSel : ''}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {r}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
