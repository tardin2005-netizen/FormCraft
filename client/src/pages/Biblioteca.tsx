import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useLibraryStore, PATTERN_CATEGORIES,
  type DesignPattern, type DesignPatternInput, type PatternCategory,
} from '../store/libraryStore'
import { normalize } from '../utils/globalSearch'
import { imageToDataUrl } from '../utils/imageData'
import s from './Biblioteca.module.css'

const splitList = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean)

const EMPTY_FORM = {
  nomePrincipal: '', sinonimos: '', categoria: 'Motion' as PatternCategory,
  oQueE: '', comoFunciona: '', ondeUsar: '', tags: '', exemploImagem: '', exemploCodigo: '',
}
type FormState = typeof EMPTY_FORM

function toForm(p: DesignPattern): FormState {
  return {
    nomePrincipal: p.nomePrincipal, sinonimos: p.sinonimos.join(', '), categoria: p.categoria,
    oQueE: p.oQueE, comoFunciona: p.comoFunciona, ondeUsar: p.ondeUsar, tags: p.tags.join(', '),
    exemploImagem: p.exemploImagem ?? '', exemploCodigo: p.exemploCodigo ?? '',
  }
}

function toInput(f: FormState): DesignPatternInput {
  return {
    nomePrincipal: f.nomePrincipal.trim(),
    sinonimos: splitList(f.sinonimos),
    categoria: f.categoria,
    oQueE: f.oQueE.trim(),
    comoFunciona: f.comoFunciona.trim(),
    ondeUsar: f.ondeUsar.trim(),
    tags: splitList(f.tags),
    exemploImagem: f.exemploImagem || undefined,
    exemploCodigo: f.exemploCodigo.trim() || undefined,
  }
}

export default function Biblioteca() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { patterns, addPattern, updatePattern, removePattern } = useLibraryStore()

  const [filter, setFilter] = useState('')
  const [cat, setCat] = useState<PatternCategory | 'Todas'>('Todas')
  const [editing, setEditing] = useState<DesignPattern | 'new' | null>(null)

  const detail = id ? patterns.find(p => p.id === id) ?? null : null

  const visible = useMemo(() => {
    const tokens = normalize(filter).split(/\s+/).filter(Boolean)
    return patterns
      .filter(p => cat === 'Todas' || p.categoria === cat)
      .filter(p => {
        if (tokens.length === 0) return true
        const hay = normalize([p.nomePrincipal, ...p.sinonimos, p.categoria, ...p.tags, p.oQueE, p.ondeUsar].join(' '))
        return tokens.every(t => hay.includes(t))
      })
      .sort((a, b) => a.nomePrincipal.localeCompare(b.nomePrincipal))
  }, [patterns, filter, cat])

  const usedCats = PATTERN_CATEGORIES.filter(c => patterns.some(p => p.categoria === c))

  function handleSave(f: FormState) {
    const input = toInput(f)
    if (editing && editing !== 'new') updatePattern(editing.id, input)
    else addPattern(input)
    setEditing(null)
  }

  function handleDelete(p: DesignPattern) {
    if (!confirm(`Excluir "${p.nomePrincipal}" da Biblioteca?`)) return
    removePattern(p.id)
    navigate('/biblioteca')
  }

  return (
    <div className={s.page}>
      <header className={s.topBar}>
        <div className={s.topLeft}>
          <h1 className={s.pageTitle}>Biblioteca</h1>
          <p className={s.pageSub}>Seu acervo de padrões de design: efeitos, técnicas e referências de UI que servem para qualquer projeto. Tudo aqui entra na busca da tela inicial.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setEditing('new')}>+ Padrão de Design</button>
      </header>

      <div className={s.toolbar}>
        <input
          className={s.filterInput}
          placeholder="Filtrar por nome, sinônimo ou tag…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div className={s.catRow}>
          {(['Todas', ...usedCats] as const).map(c => (
            <button key={c} className={`${s.catChip} ${cat === c ? s.catChipActive : ''}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {patterns.length === 0 ? (
        <button className={s.emptyCard} onClick={() => setEditing('new')}>
          <span className={s.emptyPlus}>+</span>
          <span className={s.emptyTitle}>Cadastre seu primeiro padrão</span>
          <span className={s.emptyDesc}>Hover, motion, gradientes, cards flutuantes… cada padrão vira um card pesquisável.</span>
        </button>
      ) : visible.length === 0 ? (
        <p className={s.noMatch}>Nenhum padrão bate com esse filtro.</p>
      ) : (
        <div className={s.grid}>
          {visible.map(p => (
            <button key={p.id} className={s.card} onClick={() => navigate(`/biblioteca/${p.id}`)}>
              {p.exemploImagem && (
                <div className={s.cardImg}><img src={p.exemploImagem} alt={p.nomePrincipal} /></div>
              )}
              <div className={s.cardBody}>
                <span className={s.cardCat}>{p.categoria}</span>
                <div className={s.cardTitle}>{p.nomePrincipal}</div>
                <div className={s.cardDef}>{p.oQueE}</div>
              </div>
              {p.sinonimos.length > 0 && (
                <div className={s.cardFoot}>também: {p.sinonimos.slice(0, 2).join(', ')}{p.sinonimos.length > 2 ? ` +${p.sinonimos.length - 2}` : ''}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {detail && !editing && (
        <PatternDetail
          p={detail}
          onClose={() => navigate('/biblioteca')}
          onEdit={() => setEditing(detail)}
          onDelete={() => handleDelete(detail)}
        />
      )}

      {editing && (
        <PatternForm
          initial={editing === 'new' ? EMPTY_FORM : toForm(editing)}
          isNew={editing === 'new'}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function useEscape(fn: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') fn() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fn])
}

function PatternDetail({ p, onClose, onEdit, onDelete }: {
  p: DesignPattern; onClose: () => void; onEdit: () => void; onDelete: () => void
}) {
  useEscape(onClose)
  const lines = (text: string) => text.split('\n').filter(Boolean)

  return (
    <div className={s.backdrop} onClick={onClose}>
      <article className={s.detail} onClick={e => e.stopPropagation()}>
        <div className={s.detailHead}>
          <div>
            <span className={s.cardCat}>{p.categoria}</span>
            <h2 className={s.detailTitle}>{p.nomePrincipal}</h2>
          </div>
          <button className={s.iconBtn} onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {p.sinonimos.length > 0 && (
          <div className={s.chipRow}>
            <span className={s.chipLabel}>Também chamado de</span>
            {p.sinonimos.map(x => <span key={x} className={s.chip}>{x}</span>)}
          </div>
        )}

        {p.exemploImagem && (
          <div className={s.detailImg}><img src={p.exemploImagem} alt={p.nomePrincipal} /></div>
        )}

        <section className={s.detailSection}>
          <h3>O que é</h3>
          <p>{p.oQueE}</p>
        </section>

        {p.comoFunciona && (
          <section className={s.detailSection}>
            <h3>Como funciona</h3>
            {lines(p.comoFunciona).map((l, i) => <p key={i}>{l}</p>)}
          </section>
        )}

        {p.ondeUsar && (
          <section className={s.detailSection}>
            <h3>Onde usar</h3>
            <p>{p.ondeUsar}</p>
          </section>
        )}

        {p.exemploCodigo && (
          <section className={s.detailSection}>
            <h3>Exemplo</h3>
            <pre className={s.code}><code>{p.exemploCodigo}</code></pre>
          </section>
        )}

        {p.tags.length > 0 && (
          <div className={s.chipRow}>
            {p.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}
          </div>
        )}

        <div className={s.detailActions}>
          <button className={s.dangerBtn} onClick={onDelete}>Excluir</button>
          <button className={s.secondaryBtn} onClick={onEdit}>Editar</button>
        </div>
      </article>
    </div>
  )
}

function PatternForm({ initial, isNew, onClose, onSave }: {
  initial: FormState; isNew: boolean; onClose: () => void; onSave: (f: FormState) => void
}) {
  const [f, setF] = useState(initial)
  const imgRef = useRef<HTMLInputElement>(null)
  useEscape(onClose)
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(prev => ({ ...prev, [k]: v }))
  const valid = f.nomePrincipal.trim() && f.oQueE.trim()

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try { set('exemploImagem', await imageToDataUrl(file)) }
    catch (err) { alert((err as Error).message) }
  }

  return (
    <div className={s.backdrop} onClick={onClose}>
      <form
        className={s.form}
        onClick={e => e.stopPropagation()}
        onSubmit={e => { e.preventDefault(); if (valid) onSave(f) }}
      >
        <div className={s.detailHead}>
          <h2 className={s.formTitle}>{isNew ? 'Novo padrão de design' : 'Editar padrão'}</h2>
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <label className={s.field}>
          <span className={s.label}>Nome principal *</span>
          <input className={s.input} autoFocus placeholder="ex: Floating Card Effect"
            value={f.nomePrincipal} onChange={e => set('nomePrincipal', e.target.value)} />
        </label>

        <label className={s.field}>
          <span className={s.label}>Sinônimos (separados por vírgula)</span>
          <input className={s.input} placeholder="ex: Elevated Card, Card flutuante, Hovering Card"
            value={f.sinonimos} onChange={e => set('sinonimos', e.target.value)} />
          <span className={s.hint}>Inclua o nome em português para a busca achar nos dois idiomas.</span>
        </label>

        <div className={s.field}>
          <span className={s.label}>Categoria</span>
          <div className={s.catRow}>
            {PATTERN_CATEGORIES.map(c => (
              <button type="button" key={c}
                className={`${s.catChip} ${f.categoria === c ? s.catChipActive : ''}`}
                onClick={() => set('categoria', c)}>{c}</button>
            ))}
          </div>
        </div>

        <label className={s.field}>
          <span className={s.label}>O que é * (1-2 frases)</span>
          <textarea className={`${s.input} ${s.textarea}`} rows={2}
            value={f.oQueE} onChange={e => set('oQueE', e.target.value)} />
        </label>

        <label className={s.field}>
          <span className={s.label}>Como funciona</span>
          <textarea className={`${s.input} ${s.textarea}`} rows={4} placeholder="Um passo por linha"
            value={f.comoFunciona} onChange={e => set('comoFunciona', e.target.value)} />
        </label>

        <label className={s.field}>
          <span className={s.label}>Onde usar</span>
          <input className={s.input} placeholder="ex: hero sections, botões de destaque"
            value={f.ondeUsar} onChange={e => set('ondeUsar', e.target.value)} />
        </label>

        <label className={s.field}>
          <span className={s.label}>Tags (separadas por vírgula)</span>
          <input className={s.input} placeholder="ex: gradiente, hero, sidebar"
            value={f.tags} onChange={e => set('tags', e.target.value)} />
        </label>

        <div className={s.field}>
          <span className={s.label}>Exemplo: imagem ou GIF</span>
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={onImage} />
          {f.exemploImagem ? (
            <div className={s.imgPreview}>
              <img src={f.exemploImagem} alt="" />
              <button type="button" className={s.linkDanger} onClick={() => set('exemploImagem', '')}>Remover</button>
            </div>
          ) : (
            <button type="button" className={s.uploadBtn} onClick={() => imgRef.current?.click()}>Escolher imagem</button>
          )}
        </div>

        <label className={s.field}>
          <span className={s.label}>Exemplo: código</span>
          <textarea className={`${s.input} ${s.textarea} ${s.mono}`} rows={4} placeholder=".card:hover { transform: translateY(-4px); }"
            value={f.exemploCodigo} onChange={e => set('exemploCodigo', e.target.value)} />
        </label>

        <div className={s.detailActions}>
          <button type="button" className={s.secondaryBtn} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.primaryBtn} disabled={!valid}>{isNew ? 'Salvar padrão' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  )
}
