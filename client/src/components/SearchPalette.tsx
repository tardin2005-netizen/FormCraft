import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAreasStore } from '../store/areasStore'
import { useLinksStore } from '../store/linksStore'
import { useCollectionsStore } from '../store/collectionsStore'
import s from './SearchPalette.module.css'

interface Props { onClose: () => void; initialQuery?: string }

const TYPE_ICON: Record<string, string> = { link: '🔗', pdf: '📄', nota: '📝', imagem: '🖼️', prompt: '🤖' }

export default function SearchPalette({ onClose, initialQuery = '' }: Props) {
  const navigate = useNavigate()
  const { areas } = useAreasStore()
  const { links } = useLinksStore()
  const { collections } = useCollectionsStore()
  const [query, setQuery] = useState(initialQuery)
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
  const isTagSearch = q.startsWith('#')
  const tagQ = isTagSearch ? q.slice(1) : ''

  const areaById    = Object.fromEntries(areas.map(a => [a.id, a]))

  // Tag search: match links where any tag contains the search word
  const tagMatches = isTagSearch && tagQ
    ? links.filter(l => l.tags.some(t => t.includes(tagQ)))
    : []

  // Normal search
  const matchedAreas = !isTagSearch && q ? areas.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)) : []
  const matchedCols  = !isTagSearch && q ? collections.filter(c => c.name.toLowerCase().includes(q)) : []
  const matchedLinks = !isTagSearch && q ? links.filter(l => l.title.toLowerCase().includes(q) || l.tags.some(t => t.includes(q))) : []

  const hasResults = isTagSearch
    ? tagMatches.length > 0
    : matchedAreas.length + matchedCols.length + matchedLinks.length > 0
  const noQuery = !q

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />

      <div className={s.panel}>
        <div className={s.inputRow}>
          <span className={s.searchIcon}>{isTagSearch ? '#' : '🔎'}</span>
          <input
            ref={inputRef}
            className={s.input}
            placeholder="Buscar áreas, conteúdos… ou #tag para filtrar"
            value={query}
            onChange={e => { setQuery(e.target.value); setFocused(0) }}
          />
          {query && (
            <button className={s.clearBtn} onClick={() => setQuery('')}>✕</button>
          )}
          <kbd className={s.esc} onClick={onClose}>Esc</kbd>
        </div>

        {/* Tag search mode */}
        {isTagSearch && (
          <div className={s.results}>
            {tagQ && (
              <div className={s.group}>
                <div className={s.groupLabel}>
                  Tag <span className={s.tagBadge}>#{tagQ || '…'}</span>
                  {tagMatches.length > 0 && <span className={s.tagCount}>{tagMatches.length} {tagMatches.length === 1 ? 'item' : 'itens'}</span>}
                </div>
                {tagMatches.length === 0 && (
                  <div className={s.noResults}>Nenhum item com essa tag</div>
                )}
                {tagMatches.map((link, i) => {
                  const area = areaById[link.areaId]
                  const origin = area ? `${area.emoji} ${area.title}` : 'Inbox'
                  return (
                    <div
                      key={link.id}
                      className={`${s.result} ${focused === i ? s.resultFocused : ''}`}
                      onMouseEnter={() => setFocused(i)}
                      onClick={() => { if (link.url && link.url !== '#') window.open(link.url, '_blank'); onClose() }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={s.resultIcon}>{TYPE_ICON[link.type] ?? '🔗'}</span>
                      <div className={s.resultMain}>
                        <span className={s.resultLabel}>{link.title}</span>
                        <span className={s.resultOrigin}>{origin}</span>
                      </div>
                      <div className={s.resultTags}>
                        {link.tags.slice(0, 3).map(t => (
                          <span key={t} className={`${s.resultTag} ${t === tagQ ? s.resultTagActive : ''}`}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {!tagQ && (
              <div className={s.emptyState}>
                <div className={s.emptyHint}>Digite uma tag para filtrar — ex: <strong>#curso</strong></div>
              </div>
            )}
          </div>
        )}

        {/* Normal search mode */}
        {!isTagSearch && noQuery && (
          <div className={s.emptyState}>
            <div className={s.emptyHint}>
              <span>↵</span> para abrir · <span>↑↓</span> para navegar · <span>Esc</span> para fechar
            </div>
            <div className={s.emptyHint} style={{ marginTop: 4 }}>
              Use <strong>#tag</strong> para buscar por hashtag
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

        {!isTagSearch && q && !hasResults && (
          <div className={s.noResults}>Nenhum resultado para "{query}"</div>
        )}

        {!isTagSearch && q && hasResults && (
          <div className={s.results}>
            {matchedAreas.length > 0 && (
              <div className={s.group}>
                <div className={s.groupLabel}>Áreas</div>
                {matchedAreas.map((a, i) => (
                  <div
                    key={a.id}
                    className={`${s.result} ${focused === i ? s.resultFocused : ''}`}
                    onMouseEnter={() => setFocused(i)}
                    onClick={() => { navigate(`/area/${a.id}`); onClose() }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={s.resultIcon}>{a.emoji}</span>
                    <span className={s.resultLabel}>{a.title}</span>
                    <span className={s.resultSub}>{a.desc}</span>
                  </div>
                ))}
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
                      <span className={s.resultSub}>{areaById[link.areaId]?.title ?? ''}</span>
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
