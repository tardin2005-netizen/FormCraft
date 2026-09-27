import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X, Link2, StickyNote, FileUp, GraduationCap, Sparkles, Wrench, Layers, Lightbulb } from 'lucide-react'
import { useHubsStore } from '../../store/hubsStore'
import { useLibraryStore } from '../../store/libraryStore'
import { useLinksStore } from '../../store/linksStore'
import { ALL_TOOLS } from '../../data/tools'
import { normalize, searchAll, searchTools, conceptHref } from '../../utils/globalSearch'
import VoiceSearch from '../VoiceSearch'
import s from './Home.module.css'

export type Scope = 'tudo' | 'conceitos' | 'faculdade' | 'biblioteca' | 'ferramentas'

const SCOPES: { id: Scope; label: string; Icon: typeof Layers; placeholder: string; examples: string[] }[] = [
  { id: 'tudo', label: 'Tudo', Icon: Layers, placeholder: 'Buscar em aulas, Biblioteca, ferramentas e links…', examples: ['brand equity', 'funil', 'hover', 'gerar vídeo com IA'] },
  { id: 'conceitos', label: 'Conceitos', Icon: Lightbulb, placeholder: 'Buscar termo, definição ou tag em todos os seus conceitos…', examples: ['brand equity', 'funil', 'persona'] },
  { id: 'faculdade', label: 'Faculdade', Icon: GraduationCap, placeholder: 'Buscar conceito, aula ou matéria de qualquer semestre…', examples: ['brand equity', 'prova', 'Gestão de Marcas'] },
  { id: 'biblioteca', label: 'Biblioteca', Icon: Sparkles, placeholder: 'Buscar padrão de design, efeito ou técnica…', examples: ['hover', 'card flutuante', 'animações'] },
  { id: 'ferramentas', label: 'Ferramentas', Icon: Wrench, placeholder: 'Descreva o que precisa fazer: gerar narração, editar vídeo…', examples: ['gerar vídeo com IA', 'criar artes e posts', 'analisar métricas', 'gerar narração'] },
]

function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  const norm = normalize(text)
  for (const t of tokens) {
    const i = norm.indexOf(t)
    if (i !== -1) return <>{text.slice(0, i)}<mark className={s.mark}>{text.slice(i, i + t.length)}</mark>{text.slice(i + t.length)}</>
  }
  return <>{text}</>
}

interface Props {
  query: string
  setQuery: (q: string) => void
  onSaveLink: () => void
  onQuickNote: () => void
}

export default function HomeSearch({ query, setQuery, onSaveLink, onQuickNote }: Props) {
  const navigate = useNavigate()
  const { hubs, subjects, classes, concepts } = useHubsStore()
  const { patterns } = useLibraryStore()
  const { links } = useLinksStore()
  const [scope, setScope] = useState<Scope>('tudo')
  const [addOpen, setAddOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const addRef = useRef<HTMLDivElement>(null)
  const cfg = SCOPES.find(x => x.id === scope)!
  const q = query.trim()

  useEffect(() => {
    if (!addOpen) return
    const close = (e: MouseEvent) => { if (!addRef.current?.contains(e.target as Node)) setAddOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [addOpen])

  const facHub = hubs.find(h => h.type === 'faculdade') ?? hubs[0]

  const res = useMemo(() => {
    if (!q) return null
    const tokens = normalize(q).split(/\s+/).filter(Boolean)
    const has = (...f: (string | undefined)[]) => { const hay = normalize(f.filter(Boolean).join(' ')); return tokens.every(t => hay.includes(t)) }
    const all = searchAll(q, { concepts, hubs, subjects, classes, patterns })
    const cards = all.filter(r => scope === 'tudo'
      || (scope === 'conceitos' && r.kind === 'concept')
      || (scope === 'faculdade' && r.kind === 'concept' && !!r.item.classId)
      || (scope === 'biblioteca' && r.kind === 'pattern'))
    const aulas = scope === 'tudo' || scope === 'faculdade'
      ? classes.filter(c => has(c.title, subjects.find(x => x.id === c.subjectId)?.name)).slice(0, 6)
      : []
    const tools = scope === 'tudo' || scope === 'ferramentas' ? searchTools(q, ALL_TOOLS, scope === 'ferramentas' ? 12 : 4) : []
    const saved = scope === 'tudo' ? links.filter(l => has(l.title, l.desc, ...l.tags)).slice(0, 5) : []
    return { cards, aulas, tools, saved, total: cards.length + aulas.length + tools.length + saved.length }
  }, [q, scope, concepts, hubs, subjects, classes, patterns, links])

  const openClass = (c: { hubId: string; semesterId: string; subjectId: string; id: string }) =>
    navigate(`/hub/${c.hubId}?sem=${c.semesterId}&subj=${c.subjectId}&cls=${c.id}`)

  return (
    <section className={s.searchHero}>
      <h1 className={s.searchTitle}>O que você quer encontrar ou guardar?</h1>

      <div className={s.omni}>
        <div className={s.omniRow}>
          <Search size={18} className={s.omniIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            id="home-search"
            className={s.omniInput}
            placeholder={cfg.placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setQuery('') }}
            aria-label="Buscar no FormCraft"
            autoComplete="off"
          />
          {query && (
            <button className={s.omniIconBtn} onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="Limpar busca"><X size={16} /></button>
          )}
          <div className={s.addWrap} ref={addRef}>
            <button className={s.omniAdd} onClick={() => setAddOpen(v => !v)} aria-expanded={addOpen} aria-label="Guardar algo novo">
              <Plus size={16} /><span>Guardar</span>
            </button>
            {addOpen && (
              <div className={s.addMenu} role="menu">
                <button role="menuitem" onClick={() => { setAddOpen(false); onSaveLink() }}><Link2 size={15} /> Link</button>
                <button role="menuitem" onClick={() => { setAddOpen(false); navigate('/conceitos?novo=1') }}><Lightbulb size={15} /> Conceito</button>
                <button role="menuitem" onClick={() => { setAddOpen(false); onQuickNote() }}><StickyNote size={15} /> Nota rápida</button>
                <button role="menuitem" disabled={!facHub} onClick={() => { setAddOpen(false); if (facHub) navigate(`/hub/${facHub.id}?novo=material`) }}>
                  <FileUp size={15} /> PDF numa aula
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={s.scopeRow} role="tablist" aria-label="Onde buscar">
          {SCOPES.map(({ id, label, Icon }) => (
            <button key={id} role="tab" aria-selected={scope === id}
              className={`${s.scope} ${scope === id ? s.scopeOn : ''}`}
              onClick={() => { setScope(id); inputRef.current?.focus() }}>
              <Icon size={13} />{label}
            </button>
          ))}
          <div className={s.voice}><VoiceSearch /></div>
        </div>
      </div>

      {!q && (
        <div className={s.examples}>
          <span>Experimente:</span>
          {cfg.examples.map(ex => <button key={ex} className={s.example} onClick={() => setQuery(ex)}>{ex}</button>)}
        </div>
      )}

      {res && (
        <div className={s.results}>
          {res.total === 0 ? (
            <div className={s.noResults}>
              <p><b>Nada com “{q}” em {cfg.label === 'Tudo' ? 'nenhum lugar' : cfg.label} ainda.</b></p>
              <p>O conteúdo pode existir sem estar indexado. Abra uma aula e use <b>+ Conceito</b>, ou cadastre um padrão na <b>Biblioteca</b>.</p>
              {scope !== 'tudo' && <button className={s.linkBtn} onClick={() => setScope('tudo')}>Buscar em tudo</button>}
            </div>
          ) : (
            <>
              <p className={s.resultCount}>{res.total} {res.total === 1 ? 'resultado' : 'resultados'}</p>

              {res.cards.length > 0 && (
                <div className={s.cardGrid}>
                  {res.cards.map(r => r.kind === 'concept' ? (
                    <button key={r.item.id} className={s.rCard} onClick={() => navigate(conceptHref(r.item))}>
                      {r.item.imageData && <div className={s.rImg}><img src={r.item.imageData} alt={r.item.termo} /></div>}
                      <div className={s.rBody}>
                        <span className={s.rTitle}><Highlight text={r.item.termo} query={q} /></span>
                        <span className={s.rText}>{r.item.definicao}</span>
                      </div>
                      <span className={s.rFoot}>{r.item.classId
                        ? <><span className={s.chip}>Aula</span>{r.subject?.name ?? '—'}{r.classItem ? ` · ${r.classItem.title}` : ''}</>
                        : <><span className={s.chip}>Conceito</span>{r.item.contexto || 'Avulso'}</>}</span>
                    </button>
                  ) : (
                    <button key={r.item.id} className={s.rCard} onClick={() => navigate(`/biblioteca/${r.item.id}`)}>
                      {r.item.exemploImagem && <div className={s.rImg}><img src={r.item.exemploImagem} alt={r.item.nomePrincipal} /></div>}
                      <div className={s.rBody}>
                        <span className={s.rTitle}><Highlight text={r.item.nomePrincipal} query={q} /></span>
                        <span className={s.rText}>{r.item.oQueE}</span>
                      </div>
                      <span className={s.rFoot}><span className={`${s.chip} ${s.chipLib}`}>Biblioteca</span>Padrão de design · {r.item.categoria}</span>
                    </button>
                  ))}
                </div>
              )}

              {res.aulas.length > 0 && (
                <div className={s.group}>
                  <h2 className={s.groupTitle}>Aulas e atividades</h2>
                  {res.aulas.map(c => (
                    <button key={c.id} className={s.row} onClick={() => openClass(c)}>
                      <span className={s.rowKind} data-kind={c.type}>{c.type}</span>
                      <span className={s.rowMain}><Highlight text={c.title} query={q} /></span>
                      <span className={s.rowSub}>{subjects.find(x => x.id === c.subjectId)?.name ?? ''}</span>
                    </button>
                  ))}
                </div>
              )}

              {res.tools.length > 0 && (
                <div className={s.group}>
                  <h2 className={s.groupTitle}>Ferramentas recomendadas</h2>
                  <div className={s.toolGrid}>
                    {res.tools.map(t => (
                      <a key={t.name} className={s.tool} href={t.url} target="_blank" rel="noopener noreferrer">
                        <span className={s.toolLetter} style={{ background: t.color }}>{t.letter}</span>
                        <span className={s.toolInfo}><b>{t.name}</b><span>{t.desc}</span></span>
                        <span className={s.toolPrice}>{t.pricing.toLowerCase()}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {res.saved.length > 0 && (
                <div className={s.group}>
                  <h2 className={s.groupTitle}>Seus links e notas</h2>
                  {res.saved.map(l => (
                    <a key={l.id} className={s.row} href={l.url && l.url !== '#' ? l.url : undefined} target="_blank" rel="noopener noreferrer">
                      <span className={s.rowKind}>{l.type}</span>
                      <span className={s.rowMain}><Highlight text={l.title} query={q} /></span>
                      <span className={s.rowSub}>{l.tags.slice(0, 3).map(t => `#${t}`).join(' ')}</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
