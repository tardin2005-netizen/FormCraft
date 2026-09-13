import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAreasStore } from '../store/areasStore'
import { useLinksStore } from '../store/linksStore'
import { useCollectionsStore } from '../store/collectionsStore'
import s from './SearchPalette.module.css'

interface Props { onClose: () => void }

const TYPE_ICON: Record<string, string> = { link: '🔗', pdf: '📄', nota: '📝', imagem: '🖼️', prompt: '🤖' }

export default function SearchPalette({ onClose }: Props) {
  const navigate = useNavigate()
  const { areas } = useAreasStore()
  const { links } = useLinksStore()
  const { collections } = useCollectionsStore()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const recentLinks = [...links].sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0)).slice(0, 8)

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
  const areaById = Object.fromEntries(areas.map(a => [a.id, a.title]))

  const matchedAreas = q ? areas.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)) : []
  const matchedCols  = q ? collections.filter(c => c.name.toLowerCase().includes(q)) : []
  const matchedLinks = q ? links.filter(l => l.title.toLowerCase().includes(q) || l.tags.some(t => t.includes(q))) : []

  const hasResults = matchedAreas.length + matchedCols.length + matchedLinks.length > 0
  const noQuery    = !q

  type Flat = { kind: 'area' | 'col' | 'item'; label: string; icon?: string; sub?: string }
  const flat: Flat[] = [
    ...matchedAreas.map(a => ({ kind: 'area' as const, label: a.title, icon: a.emoji, sub: a.desc })),
    ...matchedCols.map(c  => ({ kind: 'col'  as const, label: c.name, icon: '🗂️' })),
    ...matchedLinks.map(l => ({ kind: 'item' as const, label: l.title, icon: TYPE_ICON[l.type] ?? '🔗', sub: areaById[l.areaId] ?? '' })),
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
              <span>↵</span> para abrir · <span>↑↓</span> para navegar · <span>Esc</span> para fechar
            </div>
            {recentLinks.length > 0 && (
              <div className={s.quickSection}>
                <div className={s.groupLabel}>Acessos recentes</div>
                {recentLinks.map((link, i) => (
                  <div
                    key={link.id}
                    className={`${s.result} ${focused === i ? s.resultFocused : ''}`}
                    onMouseEnter={() => setFocused(i)}
                    onClick={() => { if (link.url && link.url !== '#') window.open(link.url, '_blank'); onClose() }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={s.resultIcon}>{TYPE_ICON[link.type] ?? '🔗'}</span>
                    <span className={s.resultLabel}>{link.title}</span>
                    <span className={s.resultSub}>{areas.find(a => a.id === link.areaId)?.title ?? ''}</span>
                  </div>
                ))}
              </div>
            )}
            {recentLinks.length === 0 && areas.length > 0 && (
              <div className={s.quickSection}>
                <div className={s.groupLabel}>Suas áreas</div>
                {areas.slice(0, 5).map((a, i) => (
                  <div
                    key={a.id}
                    className={`${s.result} ${focused === i ? s.resultFocused : ''}`}
                    onMouseEnter={() => setFocused(i)}
                    onClick={() => { navigate(`/area/${a.id}`); onClose() }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={s.resultIcon}>{a.emoji}</span>
                    <span className={s.resultLabel}>{a.title}</span>
                    <span className={s.resultSub}>{a.count} itens</span>
                  </div>
                ))}
              </div>
            )}
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
                      onClick={() => { navigate(`/area/${a.id}`); onClose() }}
                      style={{ cursor: 'pointer' }}
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
                      key={c.id ?? c.name}
                      className={`${s.result} ${focused === idx ? s.resultFocused : ''}`}
                      onMouseEnter={() => setFocused(idx)}
                      onClick={onClose}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={s.resultIcon}>🗂️</span>
                      <span className={s.resultLabel}>{c.name}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {matchedLinks.length > 0 && (
              <div className={s.group}>
                <div className={s.groupLabel}>Conteúdos</div>
                {matchedLinks.map((link, i) => {
                  const idx = matchedAreas.length + matchedCols.length + i
                  return (
                    <div
                      key={link.id}
                      className={`${s.result} ${focused === idx ? s.resultFocused : ''}`}
                      onMouseEnter={() => setFocused(idx)}
                      onClick={() => { if (link.url && link.url !== '#') window.open(link.url, '_blank'); onClose() }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={s.resultIcon}>{TYPE_ICON[link.type] ?? '🔗'}</span>
                      <span className={s.resultLabel}>{link.title}</span>
                      <span className={s.resultSub}>{areaById[link.areaId] ?? ''}</span>
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
