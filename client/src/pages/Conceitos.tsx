import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { useHubsStore, type Concept } from '../store/hubsStore'
import { normalize, conceptHref } from '../utils/globalSearch'
import { imageToDataUrl } from '../utils/imageData'
import EmptyState from '../components/EmptyState'
import RichText, { plainText } from '../components/RichText'
import s from './Biblioteca.module.css'
import g from './Conceitos.module.css'

type Filter = 'todos' | 'aulas' | 'avulsos' | `ctx:${string}`
type Sort = 'az' | 'recentes'

const splitList = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean)
const letterOf = (termo: string) => {
  const ch = normalize(termo.trim()).charAt(0).toUpperCase()
  return /[A-Z]/.test(ch) ? ch : '#'
}

interface FormState {
  termo: string; sinonimos: string; definicao: string; comoFunciona: string; ondeUsar: string
  imageData: string; tags: string; contexto: string
}
const EMPTY: FormState = { termo: '', sinonimos: '', definicao: '', comoFunciona: '', ondeUsar: '', imageData: '', tags: '', contexto: '' }

export default function Conceitos() {
  const { id } = useParams<{ id?: string }>()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { concepts, subjects, classes, addConcept, updateConcept, removeConcept } = useHubsStore()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')
  const [sort, setSort] = useState<Sort>('az')
  const [editing, setEditing] = useState<Concept | 'new' | null>(null)

  useEffect(() => {
    if (params.get('novo') !== '1') return
    setEditing('new')
    setParams({}, { replace: true })
  }, [params, setParams])

  const origin = (c: Concept) => {
    if (!c.classId) return c.contexto || 'Avulso'
    const subj = subjects.find(x => x.id === c.subjectId)?.name
    const cls = classes.find(x => x.id === c.classId)?.title
    return [subj, cls].filter(Boolean).join(' · ') || 'Aula'
  }

  const contexts = useMemo(
    () => [...new Set(concepts.filter(c => !c.classId && c.contexto).map(c => c.contexto!.trim()))].sort((a, b) => a.localeCompare(b)),
    [concepts],
  )

  const visible = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    return concepts
      .filter(c => filter === 'todos'
        || (filter === 'aulas' && !!c.classId)
        || (filter === 'avulsos' && !c.classId)
        || (filter.startsWith('ctx:') && !c.classId && c.contexto?.trim() === filter.slice(4)))
      .filter(c => {
        if (!tokens.length) return true
        const hay = normalize([c.termo, ...(c.sinonimos ?? []), c.definicao, c.comoFunciona, c.ondeUsar, ...c.tags, c.contexto, origin(c)].filter(Boolean).join(' '))
        return tokens.every(t => hay.includes(t))
      })
      .sort((a, b) => sort === 'az'
        ? normalize(a.termo).localeCompare(normalize(b.termo))
        : b.criadoEm.localeCompare(a.criadoEm))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts, query, filter, sort, subjects, classes])

  // Glossary groups: one per initial letter (A–Z order); a single group when sorting by recent.
  const groups = useMemo(() => {
    if (sort !== 'az') return [{ letter: '', items: visible }]
    const map = new Map<string, Concept[]>()
    for (const c of visible) { const l = letterOf(c.termo); map.set(l, [...(map.get(l) ?? []), c]) }
    return [...map.entries()].map(([letter, items]) => ({ letter, items }))
  }, [visible, sort])

  const detail = id ? concepts.find(c => c.id === id) ?? null : null

  function save(f: FormState) {
    const data = {
      termo: f.termo.trim(),
      sinonimos: splitList(f.sinonimos),
      definicao: f.definicao.trim(),
      comoFunciona: f.comoFunciona.trim() || undefined,
      ondeUsar: f.ondeUsar.trim() || undefined,
      imageData: f.imageData || undefined,
      tags: splitList(f.tags),
    }
    if (editing && editing !== 'new') {
      updateConcept(editing.id, editing.classId ? data : { ...data, contexto: f.contexto.trim() || undefined })
      setEditing(null)
    } else {
      const created = addConcept({ ...data, contexto: f.contexto.trim() || undefined })
      setEditing(null)
      navigate(`/conceitos/${created.id}`)
    }
  }

  function remove(c: Concept) {
    if (!confirm(`Excluir o conceito "${c.termo}"?`)) return
    removeConcept(c.id)
    navigate('/conceitos')
  }

  const countAulas = concepts.filter(c => c.classId).length
  const chips: [Filter, string][] = [
    ['todos', `Todos · ${concepts.length}`],
    ['aulas', `Das aulas · ${countAulas}`],
    ['avulsos', `Avulsos · ${concepts.length - countAulas}`],
    ...contexts.map(ctx => [`ctx:${ctx}`, ctx] as [Filter, string]),
  ]

  return (
    <div className={s.page}>
      <header className={s.topBar}>
        <div className={s.topLeft}>
          <h1 className={s.pageTitle}>Conceitos</h1>
          <p className={s.pageSub}>Seu glossário: os termos que você quer achar depois, de uma aula, do trabalho ou de qualquer assunto. Todos entram na busca da tela inicial.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setEditing('new')}>+ Conceito</button>
      </header>

      {concepts.length > 0 && (
        <div className={s.toolbar}>
          <div className={g.toolRow}>
            <input
              id="conceitos-filtro"
              className={s.filterInput}
              placeholder="Filtrar por termo, sinônimo, definição, tag ou contexto…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className={g.sortToggle} role="radiogroup" aria-label="Ordem">
              <button role="radio" aria-checked={sort === 'az'} className={sort === 'az' ? g.sortOn : ''} onClick={() => setSort('az')}>A–Z</button>
              <button role="radio" aria-checked={sort === 'recentes'} className={sort === 'recentes' ? g.sortOn : ''} onClick={() => setSort('recentes')}>Recentes</button>
            </div>
          </div>
          <div className={s.catRow}>
            {chips.map(([f, label]) => (
              <button key={f} className={`${s.catChip} ${filter === f ? s.catChipActive : ''}`} onClick={() => setFilter(f)}>{label}</button>
            ))}
          </div>
          {sort === 'az' && groups.length > 1 && (
            <nav className={g.letters} aria-label="Ir para a letra">
              {groups.map(({ letter }) => (
                <a key={letter} href={`#letra-${letter}`} onClick={e => { e.preventDefault(); document.getElementById(`letra-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>{letter}</a>
              ))}
            </nav>
          )}
        </div>
      )}

      {concepts.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={20} />}
          title="Seu glossário está vazio"
          actions={[{ label: '+ Conceito', onClick: () => setEditing('new') }]}
        >
          Guarde aqui qualquer termo que você quer achar depois: o que é, como funciona, onde usar e outros nomes para a mesma coisa. Conceitos criados dentro de uma aula também aparecem aqui.
        </EmptyState>
      ) : visible.length === 0 ? (
        <p className={s.noMatch}>Nenhum conceito bate com esse filtro.</p>
      ) : (
        <div className={g.glossary}>
          {groups.map(({ letter, items }) => (
            <section key={letter || 'all'} className={g.group} aria-labelledby={letter ? `letra-${letter}` : undefined}>
              {letter && <h2 id={`letra-${letter}`} className={g.letter}>{letter}</h2>}
              {sort === 'az' ? (
                <ul className={g.entries}>
                  {items.map(c => (
                    <li key={c.id}>
                      <button className={g.entry} onClick={() => navigate(`/conceitos/${c.id}`)}>
                        <span className={g.entryTerm}>
                          <b>{c.termo}</b>
                          {!!c.sinonimos?.length && <span>{c.sinonimos.join(' · ')}</span>}
                        </span>
                        <span className={g.entryDef}>{plainText(c.definicao)}</span>
                        <span className={g.entryMeta}>
                          {c.imageData && <img src={c.imageData} alt="" className={g.entryThumb} />}
                          <span className={g.entryOrigin}>{origin(c)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
              <div className={s.grid}>
                {items.map(c => (
                  <button key={c.id} className={s.card} onClick={() => navigate(`/conceitos/${c.id}`)}>
                    {c.imageData && <div className={s.cardImg}><img src={c.imageData} alt={c.termo} /></div>}
                    <div className={s.cardBody}>
                      <span className={s.cardCat}>{c.classId ? 'Aula' : (c.contexto || 'Conceito')}</span>
                      <div className={s.cardTitle}>{c.termo}</div>
                      <div className={s.cardDef}>{plainText(c.definicao)}</div>
                    </div>
                    <div className={s.cardFoot}>
                      {c.sinonimos?.length
                        ? <>também: {c.sinonimos.slice(0, 2).join(', ')}{c.sinonimos.length > 2 ? ` +${c.sinonimos.length - 2}` : ''}</>
                        : origin(c)}
                    </div>
                  </button>
                ))}
              </div>
              )}
            </section>
          ))}
        </div>
      )}

      {detail && !editing && (
        <div className={s.backdrop} onClick={() => navigate('/conceitos')}>
          <article className={s.detail} onClick={e => e.stopPropagation()}>
            <div className={s.detailHead}>
              <div>
                <span className={s.cardCat}>{detail.classId ? 'Conceito de aula' : (detail.contexto || 'Conceito')}</span>
                <h2 className={s.detailTitle}>{detail.termo}</h2>
              </div>
              <button className={s.iconBtn} onClick={() => navigate('/conceitos')} aria-label="Fechar">✕</button>
            </div>

            {!!detail.sinonimos?.length && (
              <div className={s.chipRow}>
                <span className={s.chipLabel}>Também chamado de</span>
                {detail.sinonimos.map(x => <span key={x} className={s.chip}>{x}</span>)}
              </div>
            )}

            {detail.imageData && <div className={s.detailImg}><img src={detail.imageData} alt={detail.termo} /></div>}

            <section className={s.detailSection}>
              <h3>O que é</h3>
              <RichText text={detail.definicao} />
            </section>
            {detail.comoFunciona && (
              <section className={s.detailSection}>
                <h3>Como funciona</h3>
                <RichText text={detail.comoFunciona} />
              </section>
            )}
            {detail.ondeUsar && (
              <section className={s.detailSection}>
                <h3>Onde usar</h3>
                <RichText text={detail.ondeUsar} />
              </section>
            )}
            <section className={s.detailSection}>
              <h3>Origem</h3>
              <p>{origin(detail)}</p>
            </section>
            {detail.tags.length > 0 && (
              <div className={s.chipRow}>{detail.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
            )}
            <div className={s.detailActions}>
              <button className={s.dangerBtn} onClick={() => remove(detail)}>Excluir</button>
              {detail.classId && <button className={s.secondaryBtn} onClick={() => navigate(conceptHref(detail))}>Abrir aula</button>}
              <button className={s.primaryBtn} onClick={() => setEditing(detail)}>Editar</button>
            </div>
          </article>
        </div>
      )}

      {editing && (
        <ConceptForm
          initial={editing === 'new' ? EMPTY : {
            termo: editing.termo, sinonimos: (editing.sinonimos ?? []).join(', '), definicao: editing.definicao,
            comoFunciona: editing.comoFunciona ?? '', ondeUsar: editing.ondeUsar ?? '', imageData: editing.imageData ?? '',
            tags: editing.tags.join(', '), contexto: editing.contexto ?? '',
          }}
          linkedTo={editing !== 'new' && editing.classId ? origin(editing) : null}
          contexts={contexts}
          isNew={editing === 'new'}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  )
}

function ConceptForm({ initial, linkedTo, contexts, isNew, onClose, onSave }: {
  initial: FormState; linkedTo: string | null; contexts: string[]; isNew: boolean
  onClose: () => void; onSave: (f: FormState) => void
}) {
  const [f, setF] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [imgError, setImgError] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(prev => ({ ...prev, [k]: v }))
  const valid = !!f.termo.trim() && !!f.definicao.trim()
  const textHint = 'Linha em branco separa parágrafos; comece a linha com * ou - para virar lista.'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onImage(file: File | undefined) {
    if (!file) return
    setBusy(true); setImgError('')
    try { set('imageData', await imageToDataUrl(file)) }
    catch (err) { setImgError((err as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div className={s.backdrop} onClick={onClose}>
      <form className={s.form} onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); if (valid && !busy) onSave(f) }}>
        <div className={s.detailHead}>
          <h2 className={s.formTitle}>{isNew ? 'Novo conceito' : 'Editar conceito'}</h2>
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <label className={s.field}>
          <span className={s.label}>Termo *</span>
          <input id="conceito-termo" className={s.input} autoFocus placeholder="ex: PWA, Brand equity, Churn"
            value={f.termo} onChange={e => set('termo', e.target.value)} />
        </label>

        <label className={s.field}>
          <span className={s.label}>Também chamado de (separados por vírgula)</span>
          <input id="conceito-sinonimos" className={s.input} placeholder="ex: Progressive Web App, App instalável"
            value={f.sinonimos} onChange={e => set('sinonimos', e.target.value)} />
          <span className={s.hint}>A busca encontra o conceito por qualquer um desses nomes.</span>
        </label>

        <label className={s.field}>
          <span className={s.label}>O que é *</span>
          <textarea id="conceito-definicao" className={`${s.input} ${s.textarea}`} rows={4} placeholder="A definição em 1 ou 2 frases."
            value={f.definicao} onChange={e => set('definicao', e.target.value)} />
        </label>

        <label className={s.field}>
          <span className={s.label}>Como funciona (opcional)</span>
          <textarea id="conceito-como" className={`${s.input} ${s.textarea}`} rows={5} placeholder="Detalhes, passos, onde fica configurado…"
            value={f.comoFunciona} onChange={e => set('comoFunciona', e.target.value)} />
          <span className={s.hint}>{textHint}</span>
        </label>

        <label className={s.field}>
          <span className={s.label}>Onde usar (opcional)</span>
          <textarea id="conceito-onde" className={`${s.input} ${s.textarea}`} rows={3} placeholder="Casos de uso e exemplos práticos."
            value={f.ondeUsar} onChange={e => set('ondeUsar', e.target.value)} />
        </label>

        {linkedTo ? (
          <div className={s.field}>
            <span className={s.label}>Origem</span>
            <span className={s.hint}>Vinculado à aula: {linkedTo}</span>
          </div>
        ) : (
          <label className={s.field}>
            <span className={s.label}>Contexto (opcional)</span>
            <input id="conceito-contexto" className={s.input} list="conceito-contextos" placeholder="ex: Marketing, Trabalho, Design"
              value={f.contexto} onChange={e => set('contexto', e.target.value)} />
            <datalist id="conceito-contextos">{contexts.map(c => <option key={c} value={c} />)}</datalist>
            <span className={s.hint}>Agrupa conceitos que não são de uma aula. Vira um filtro na página.</span>
          </label>
        )}

        <label className={s.field}>
          <span className={s.label}>Tags (separadas por vírgula)</span>
          <input id="conceito-tags" className={s.input} placeholder="ex: design, pwa"
            value={f.tags} onChange={e => set('tags', e.target.value)} />
        </label>

        <div className={s.field}>
          <span className={s.label}>Imagem (print ou exemplo, opcional)</span>
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={e => { onImage(e.target.files?.[0]); e.target.value = '' }} />
          {f.imageData ? (
            <div className={s.imgPreview}>
              <img src={f.imageData} alt="" />
              <button type="button" className={s.linkDanger} onClick={() => set('imageData', '')}>Remover</button>
            </div>
          ) : (
            <button type="button" className={s.uploadBtn} onClick={() => imgRef.current?.click()} disabled={busy}>{busy ? 'Preparando imagem…' : 'Escolher imagem'}</button>
          )}
          {imgError && <span className={s.hint} style={{ color: '#f43f5e' }}>{imgError}</span>}
        </div>

        <div className={s.detailActions}>
          <button type="button" className={s.secondaryBtn} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.primaryBtn} disabled={!valid || busy}>{isNew ? 'Salvar conceito' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  )
}
