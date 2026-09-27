import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAreasStore } from '../store/areasStore'
import { useLinksStore } from '../store/linksStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useHubsStore } from '../store/hubsStore'
import { useLibraryStore } from '../store/libraryStore'
import { ALL_TOOLS } from '../data/tools'
import { normalize, searchAll, searchTools } from '../utils/globalSearch'
import s from './SearchPalette.module.css'

interface Props { onClose: () => void; initialQuery?: string }

const TYPE_ICON: Record<string, string> = { link: '🔗', pdf: '📄', nota: '📝', imagem: '🖼️', prompt: '🤖' }

interface Row {
  key: string
  group: string
  icon: React.ReactNode
  label: string
  sub?: string
  tags?: string[]
  run: () => void
}

export default function SearchPalette({ onClose, initialQuery = '' }: Props) {
  const navigate = useNavigate()
  const { areas } = useAreasStore()
  const { links } = useLinksStore()
  const { collections } = useCollectionsStore()
  const { hubs, subjects, classes, concepts } = useHubsStore()
  const { patterns } = useLibraryStore()
  const [query, setQuery] = useState(initialQuery)
  const [focused, setFocused] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const q = normalize(query.trim())
  const isTagSearch = q.startsWith('#')
  const tagQ = isTagSearch ? q.slice(1) : ''

  const rows = useMemo<Row[]>(() => {
    const areaById = Object.fromEntries(areas.map(a => [a.id, a]))
    const openLink = (url: string) => { if (url && url !== '#') window.open(url, '_blank', 'noopener'); onClose() }
    const go = (path: string) => { navigate(path); onClose() }
    const linkRow = (l: typeof links[number], group: string): Row => ({
      key: 'l' + l.id, group, icon: TYPE_ICON[l.type] ?? '🔗', label: l.title,
      sub: areaById[l.areaId]?.title ?? 'Inbox', tags: l.tags.slice(0, 3), run: () => openLink(l.url),
    })

    if (isTagSearch) {
      if (!tagQ) return []
      return links.filter(l => l.tags.some(t => normalize(t).includes(tagQ))).map(l => linkRow(l, `Tag #${tagQ}`))
    }

    if (!q) {
      const recent = [...links].sort((a, b) => b.savedAt - a.savedAt).slice(0, 6).map(l => linkRow(l, 'Acessos recentes'))
      if (recent.length) return recent
      return areas.slice(0, 5).map(a => ({ key: 'a' + a.id, group: 'Suas áreas', icon: a.emoji, label: a.title, sub: `${a.count} itens`, run: () => go(`/area/${a.id}`) }))
    }

    const tokens = q.split(/\s+/)
    const has = (...fields: (string | undefined)[]) => { const hay = normalize(fields.filter(Boolean).join(' ')); return tokens.every(t => hay.includes(t)) }
    const out: Row[] = []

    areas.filter(a => has(a.title, a.desc)).forEach(a =>
      out.push({ key: 'a' + a.id, group: 'Áreas', icon: a.emoji, label: a.title, sub: a.desc, run: () => go(`/area/${a.id}`) }))
    hubs.filter(h => has(h.name)).forEach(h =>
      out.push({ key: 'h' + h.id, group: 'Hubs', icon: h.emoji, label: h.name, run: () => go(`/hub/${h.id}`) }))
    collections.filter(c => has(c.name, c.desc)).forEach(c =>
      out.push({ key: 'c' + c.id, group: 'Coleções', icon: c.emoji, label: c.name, sub: `${c.itemIds.length} itens`, run: () => go('/colecoes') }))

    searchAll(query, { concepts, hubs, subjects, classes, patterns }).slice(0, 8).forEach(r => {
      if (r.kind === 'concept') {
        const c = r.item
        out.push({ key: 'k' + c.id, group: 'Conceitos das aulas', icon: '💡', label: c.termo,
          sub: [r.subject?.name, r.classItem?.title].filter(Boolean).join(' · '),
          run: () => go(`/hub/${c.hubId}?sem=${c.semesterId}&subj=${c.subjectId}&cls=${c.classId}`) })
      } else {
        const p = r.item
        out.push({ key: 'p' + p.id, group: 'Biblioteca', icon: '✦', label: p.nomePrincipal, sub: p.categoria, run: () => go(`/biblioteca/${p.id}`) })
      }
    })

    links.filter(l => has(l.title, l.desc, ...l.tags)).slice(0, 8).forEach(l => out.push(linkRow(l, 'Conteúdos')))

    searchTools(query, ALL_TOOLS).forEach(t =>
      out.push({ key: 't' + t.name, group: 'Ferramentas recomendadas', icon: <span className={s.toolLetter} style={{ background: t.color }}>{t.letter}</span>,
        label: t.name, sub: t.desc, run: () => openLink(t.url) }))

    return out
  }, [q, isTagSearch, tagQ, query, areas, links, collections, hubs, subjects, classes, concepts, patterns, navigate, onClose])

  useEffect(() => { setFocused(0) }, [query])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(rows.length - 1, f + 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocused(f => Math.max(0, f - 1)) }
      else if (e.key === 'Enter' && rows[focused]) { e.preventDefault(); rows[focused].run() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, rows, focused])

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${focused}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [focused])

  const groups: { name: string; items: { row: Row; idx: number }[] }[] = []
  rows.forEach((row, idx) => {
    const g = groups.find(x => x.name === row.group)
    if (g) g.items.push({ row, idx })
    else groups.push({ name: row.group, items: [{ row, idx }] })
  })

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />

      <div className={s.panel} role="dialog" aria-label="Buscar no FormCraft">
        <div className={s.inputRow}>
          <span className={s.searchIcon}>{isTagSearch ? '#' : '🔎'}</span>
          <input
            ref={inputRef}
            className={s.input}
            placeholder="Buscar tudo: áreas, aulas, conceitos, ferramentas… ou #tag"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-activedescendant={rows[focused] ? `sp-${focused}` : undefined}
          />
          {query && <button className={s.clearBtn} onClick={() => setQuery('')} aria-label="Limpar">✕</button>}
          <kbd className={s.esc} onClick={onClose}>Esc</kbd>
        </div>

        {!q && !isTagSearch && (
          <div className={s.emptyState}>
            <div className={s.emptyHint}>
              <span>↵</span> para abrir · <span>↑↓</span> para navegar · <span>Esc</span> para fechar · <strong>#tag</strong> filtra por hashtag
            </div>
          </div>
        )}

        {isTagSearch && !tagQ && (
          <div className={s.emptyState}>
            <div className={s.emptyHint}>Digite uma tag para filtrar — ex: <strong>#curso</strong></div>
          </div>
        )}

        {(q || isTagSearch) && rows.length === 0 && (isTagSearch ? tagQ : true) && (
          <div className={s.noResults}>Nada encontrado para “{query.trim()}”. Tente outra palavra ou um sinônimo.</div>
        )}

        {groups.length > 0 && (
          <div className={s.results} ref={listRef}>
            {groups.map(g => (
              <div key={g.name} className={s.group}>
                <div className={s.groupLabel}>{g.name}</div>
                {g.items.map(({ row, idx }) => (
                  <div
                    key={row.key}
                    id={`sp-${idx}`}
                    data-idx={idx}
                    role="option"
                    aria-selected={focused === idx}
                    className={`${s.result} ${focused === idx ? s.resultFocused : ''}`}
                    onMouseEnter={() => setFocused(idx)}
                    onClick={row.run}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={s.resultIcon}>{row.icon}</span>
                    <div className={s.resultMain}>
                      <span className={s.resultLabel}>{row.label}</span>
                      {row.sub && <span className={s.resultOrigin}>{row.sub}</span>}
                    </div>
                    {row.tags && row.tags.length > 0 && (
                      <div className={s.resultTags}>
                        {row.tags.map(t => (
                          <span key={t} className={`${s.resultTag} ${normalize(t) === tagQ ? s.resultTagActive : ''}`}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
