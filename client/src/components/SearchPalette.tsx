import { useState, useEffect, useRef } from 'react'
import { useAreasStore } from '../store/areasStore'
import s from './SearchPalette.module.css'

interface Props { onClose: () => void }

const STATIC_ITEMS = [
  { icon: '📄', label: 'Princípios de Design Visual.pdf', type: 'pdf',   area: 'UX & Design' },
  { icon: '🔗', label: 'Figma Handbook',                  type: 'link',  area: 'UX & Design' },
  { icon: '📝', label: 'Ideias para o TCC',               type: 'nota',  area: 'Faculdade'   },
  { icon: '🖼️', label: 'Moodboard marca pessoal',         type: 'imagem',area: 'Design'      },
  { icon: '🤖', label: 'Prompt para geração de paleta',   type: 'prompt',area: 'UX & Design' },
  { icon: '🔗', label: 'React Docs',                      type: 'link',  area: 'Dev'         },
  { icon: '🔗', label: 'Nielsen Heuristics',              type: 'link',  area: 'UX & Design' },
  { icon: '📄', label: 'Metodologia Científica.pdf',      type: 'pdf',   area: 'Faculdade'   },
]

const COLLECTIONS = ['Referências de UI', 'Leituras de UX', 'Dev Tools', 'Artigos para TCC']

export default function SearchPalette({ onClose }: Props) {
  const { areas } = useAreasStore()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => f + 1) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(0, f - 1)) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const q = query.toLowerCase().trim()

  const matchedAreas   = q ? areas.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)) : []
  const matchedCols    = q ? COLLECTIONS.filter(c => c.toLowerCase().includes(q)) : []
  const matchedItems   = q ? STATIC_ITEMS.filter(i => i.label.toLowerCase().includes(q) || i.area.toLowerCase().includes(q)) : []

  const hasResults     = matchedAreas.length + matchedCols.length + matchedItems.length > 0
  const noQuery        = !q

  // Flat list for keyboard nav
  type Flat = { kind: 'area' | 'col' | 'item'; label: string; icon?: string; sub?: string }
  const flat: Flat[] = [
    ...matchedAreas.map(a => ({ kind: 'area' as const, label: a.title, icon: a.emoji, sub: a.desc })),
    ...matchedCols.map(c  => ({ kind: 'col'  as const, label: c, icon: '🗂️' })),
    ...matchedItems.map(i => ({ kind: 'item' as const, label: i.label, icon: i.icon, sub: i.area })),
  ]

  return (
    <>
      {/* Subtle backdrop — doesn't block the app, just closes on click */}
      <div className={s.backdrop} onClick={onClose} />

      <div className={s.panel}>
        <div className={s.inputRow}>
          <span className={s.searchIcon}>🔎</span>
          <input
            ref={inputRef}
            className={s.input}
            placeholder="Buscar áreas, conteúdos, coleções..."
            value={query}
            onChange={e => { setQuery(e.target.value); setFocused(0) }}
          />
          {query && (
            <button className={s.clearBtn} onClick={() => setQuery('')}>✕</button>
          )}
          <kbd className={s.esc} onClick={onClose}>Esc</kbd>
        </div>

        {noQuery && (
          <div className={s.emptyState}>
            <div className={s.emptyHint}>
              <span>↵</span> para entrar · <span>↑↓</span> para navegar · <span>Esc</span> para fechar
            </div>
            <div className={s.quickSection}>
              <div className={s.groupLabel}>Suas áreas</div>
              {areas.slice(0, 5).map((a, i) => (
                <div
                  key={a.id}
                  className={`${s.result} ${focused === i ? s.resultFocused : ''}`}
                  onMouseEnter={() => setFocused(i)}
                >
                  <span className={s.resultIcon}>{a.emoji}</span>
                  <span className={s.resultLabel}>{a.title}</span>
                  <span className={s.resultSub}>{a.count} itens</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {q && !hasResults && (
          <div className={s.noResults}>Nenhum resultado para "{query}"</div>
        )}

        {q && hasResults && (
          <div className={s.results}>
            {matchedAreas.length > 0 && (
              <div className={s.group}>
                <div className={s.groupLabel}>Áreas</div>
                {matchedAreas.map((a, i) => {
                  const idx = i
                  return (
                    <div
                      key={a.id}
                      className={`${s.result} ${focused === idx ? s.resultFocused : ''}`}
                      onMouseEnter={() => setFocused(idx)}
                    >
                      <span className={s.resultIcon}>{a.emoji}</span>
                      <span className={s.resultLabel}>{a.title}</span>
                      <span className={s.resultSub}>{a.desc}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {matchedCols.length > 0 && (
              <div className={s.group}>
                <div className={s.groupLabel}>Coleções</div>
                {matchedCols.map((c, i) => {
                  const idx = matchedAreas.length + i
                  return (
                    <div
                      key={c}
                      className={`${s.result} ${focused === idx ? s.resultFocused : ''}`}
                      onMouseEnter={() => setFocused(idx)}
                    >
                      <span className={s.resultIcon}>🗂️</span>
                      <span className={s.resultLabel}>{c}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {matchedItems.length > 0 && (
              <div className={s.group}>
                <div className={s.groupLabel}>Conteúdos</div>
                {matchedItems.map((item, i) => {
                  const idx = matchedAreas.length + matchedCols.length + i
                  return (
                    <div
                      key={item.label}
                      className={`${s.result} ${focused === idx ? s.resultFocused : ''}`}
                      onMouseEnter={() => setFocused(idx)}
                    >
                      <span className={s.resultIcon}>{item.icon}</span>
                      <span className={s.resultLabel}>{item.label}</span>
                      <span className={s.resultSub}>{item.area}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
