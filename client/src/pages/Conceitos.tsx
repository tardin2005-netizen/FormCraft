import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { useHubsStore, type Concept } from '../store/hubsStore'
import { normalize, conceptHref } from '../utils/globalSearch'
import { imageToDataUrl } from '../utils/imageData'
import EmptyState from '../components/EmptyState'
import s from './Biblioteca.module.css'

type Filter = 'todos' | 'aulas' | 'avulsos' | `ctx:${string}`

const splitList = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean)

interface FormState { termo: string; definicao: string; imageData: string; tags: string; contexto: string }
const EMPTY: FormState = { termo: '', definicao: '', imageData: '', tags: '', contexto: '' }

export default function Conceitos() {
  const { id } = useParams<{ id?: string }>()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { concepts, subjects, classes, addConcept, updateConcept, removeConcept } = useHubsStore()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')
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
        const hay = normalize([c.termo, c.definicao, ...c.tags, c.contexto, origin(c)].filter(Boolean).join(' '))
        return tokens.every(t => hay.includes(t))
      })
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts, query, filter, subjects, classes])

  const detail = id ? concepts.find(c => c.id === id) ?? null : null

  function save(f: FormState) {
    const data = {
      termo: f.termo.trim(),
      definicao: f.definicao.trim(),
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
          <p className={s.pageSub}>Os termos que você quer achar depois, de uma aula, do trabalho ou de qualquer assunto. Todos entram na busca da tela inicial.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setEditing('new')}>+ Conceito</button>
      </header>

      {concepts.length > 0 && (
        <div className={s.toolbar}>
          <input
            id="conceitos-filtro"
            className={s.filterInput}
            placeholder="Filtrar por termo, definição, tag ou contexto…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className={s.catRow}>
            {chips.map(([f, label]) => (
              <button key={f} className={`${s.catChip} ${filter === f ? s.catChipActive : ''}`} onClick={() => setFilter(f)}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {concepts.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={20} />}
          title="Nenhum conceito ainda"
          actions={[{ label: '+ Conceito', onClick: () => setEditing('new') }]}
        >
          Guarde aqui qualquer termo que você quer achar depois, com uma definição curta e, se quiser, a imagem do slide. Conceitos criados dentro de uma aula também aparecem aqui.
        </EmptyState>
      ) : visible.length === 0 ? (
        <p className={s.noMatch}>Nenhum conceito bate com esse filtro.</p>
      ) : (
        <div className={s.grid}>
          {visible.map(c => (
            <button key={c.id} className={s.card} onClick={() => navigate(`/conceitos/${c.id}`)}>
              {c.imageData && <div className={s.cardImg}><img src={c.imageData} alt={c.termo} /></div>}
              <div className={s.cardBody}>
                <span className={s.cardCat}>{c.classId ? 'Aula' : 'Conceito'}</span>
                <div className={s.cardTitle}>{c.termo}</div>
                <div className={s.cardDef}>{c.definicao}</div>
              </div>
              <div className={s.cardFoot}>{origin(c)}</div>
            </button>
          ))}
        </div>
      )}

      {detail && !editing && (
        <div className={s.backdrop} onClick={() => navigate('/conceitos')}>
          <article className={s.detail} onClick={e => e.stopPropagation()}>
            <div className={s.detailHead}>
              <div>
                <span className={s.cardCat}>{detail.classId ? 'Conceito de aula' : 'Conceito'}</span>
                <h2 className={s.detailTitle}>{detail.termo}</h2>
              </div>
              <button className={s.iconBtn} onClick={() => navigate('/conceitos')} aria-label="Fechar">✕</button>
            </div>
            {detail.imageData && <div className={s.detailImg}><img src={detail.imageData} alt={detail.termo} /></div>}
            <section className={s.detailSection}>
              <h3>Definição</h3>
              <p>{detail.definicao}</p>
            </section>
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
            termo: editing.termo, definicao: editing.definicao, imageData: editing.imageData ?? '',
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
          <input id="conceito-termo" className={s.input} autoFocus placeholder="ex: Brand equity, Persona, Churn"
            value={f.termo} onChange={e => set('termo', e.target.value)} />
        </label>

        <label className={s.field}>
          <span className={s.label}>Definição * (1-2 frases)</span>
          <textarea id="conceito-definicao" className={`${s.input} ${s.textarea}`} rows={3} placeholder="Explique com suas palavras…"
            value={f.definicao} onChange={e => set('definicao', e.target.value)} />
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
          <input id="conceito-tags" className={s.input} placeholder="ex: branding, métricas"
            value={f.tags} onChange={e => set('tags', e.target.value)} />
        </label>

        <div className={s.field}>
          <span className={s.label}>Imagem (print do slide, opcional)</span>
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
