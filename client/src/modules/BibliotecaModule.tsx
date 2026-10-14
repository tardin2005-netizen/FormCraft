import { useMemo, useRef, useState } from 'react'
import {
  useLibraryStore, PATTERN_CATEGORIES,
  type DesignPattern, type DesignPatternInput, type PatternCategory,
} from '../store/libraryStore'
import { normalize } from '../utils/globalSearch'
import { imageToDataUrl } from '../utils/imageData'
import RichText, { plainText } from '../components/RichText'
import s from './BibliotecaModule.module.css'

const splitList = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean)

const EMPTY_FORM = {
  nomePrincipal: '', sinonimos: '', categoria: 'Outro' as PatternCategory,
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
    nomePrincipal: f.nomePrincipal.trim(), sinonimos: splitList(f.sinonimos), categoria: f.categoria,
    oQueE: f.oQueE.trim(), comoFunciona: f.comoFunciona.trim(), ondeUsar: f.ondeUsar.trim(),
    tags: splitList(f.tags), exemploImagem: f.exemploImagem || undefined,
    exemploCodigo: f.exemploCodigo.trim() || undefined,
  }
}

export default function BibliotecaModule() {
  const { patterns, addPattern, updatePattern, removePattern } = useLibraryStore()
  const [filter, setFilter] = useState('')
  const [cat, setCat] = useState<PatternCategory | 'Todas'>('Todas')
  const [detail, setDetail] = useState<DesignPattern | null>(null)
  const [editing, setEditing] = useState<DesignPattern | 'new' | null>(null)

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

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <h2 className={s.title}>Biblioteca</h2>
        <button className={s.addBtn} onClick={() => setEditing('new')}>+ Padrão</button>
      </div>

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
        <div className={s.empty}>
          <div className={s.emptyIcon}>📚</div>
          <div className={s.emptyTitle}>Nenhum padrão cadastrado</div>
          <div className={s.emptyDesc}>Cadastre padrões de design (hover, motion, gradientes…) e eles aparecerão aqui.</div>
        </div>
      ) : visible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🔍</div>
          <div className={s.emptyTitle}>Nenhum resultado</div>
          <div className={s.emptyDesc}>Tente ajustar o filtro ou a categoria.</div>
        </div>
      ) : (
        <div className={s.grid}>
          {visible.map(p => (
            <button key={p.id} className={s.card} onClick={() => setDetail(p)}>
              {p.exemploImagem && (
                <div className={s.cardImg}><img src={p.exemploImagem} alt={p.nomePrincipal} /></div>
              )}
              <div className={s.cardBody}>
                <span className={s.cardCat}>{p.categoria}</span>
                <div className={s.cardTitle}>{p.nomePrincipal}</div>
                <div className={s.cardDef}>{plainText(p.oQueE)}</div>
              </div>
              {p.sinonimos.length > 0 && (
                <div className={s.cardFoot}>também: {p.sinonimos.slice(0, 2).join(', ')}{p.sinonimos.length > 2 ? ` +${p.sinonimos.length - 2}` : ''}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {detail && !editing && (
        <div className={s.backdrop} onClick={() => setDetail(null)}>
          <article className={s.detail} onClick={e => e.stopPropagation()}>
            <div className={s.detailHead}>
              <div>
                <span className={s.cardCat}>{detail.categoria}</span>
                <h2 className={s.detailTitle}>{detail.nomePrincipal}</h2>
              </div>
              <button className={s.iconBtn} onClick={() => setDetail(null)}>✕</button>
            </div>
            {detail.sinonimos.length > 0 && (
              <div className={s.chipRow}>
                <span className={s.chipLabel}>Também chamado de</span>
                {detail.sinonimos.map(x => <span key={x} className={s.chip}>{x}</span>)}
              </div>
            )}
            {detail.exemploImagem && <div className={s.detailImg}><img src={detail.exemploImagem} alt="" /></div>}
            <section className={s.detailSection}><h3>O que é</h3><RichText text={detail.oQueE} /></section>
            {detail.comoFunciona && <section className={s.detailSection}><h3>Como funciona</h3><RichText text={detail.comoFunciona} /></section>}
            {detail.ondeUsar && <section className={s.detailSection}><h3>Onde usar</h3><RichText text={detail.ondeUsar} /></section>}
            {detail.exemploCodigo && <section className={s.detailSection}><h3>Exemplo</h3><pre className={s.code}><code>{detail.exemploCodigo}</code></pre></section>}
            {detail.tags.length > 0 && <div className={s.chipRow}>{detail.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>}
            <div className={s.detailActions}>
              <button className={s.dangerBtn} onClick={() => { if (confirm(`Excluir "${detail.nomePrincipal}"?`)) { removePattern(detail.id); setDetail(null) } }}>Excluir</button>
              <button className={s.secondaryBtn} onClick={() => setEditing(detail)}>Editar</button>
            </div>
          </article>
        </div>
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

function PatternForm({ initial, isNew, onClose, onSave }: {
  initial: FormState; isNew: boolean; onClose: () => void; onSave: (f: FormState) => void
}) {
  const [f, setF] = useState(initial)
  const imgRef = useRef<HTMLInputElement>(null)
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
      <form className={s.form} onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); if (valid) onSave(f) }}>
        <div className={s.detailHead}>
          <h2 className={s.formTitle}>{isNew ? 'Novo padrão de design' : 'Editar padrão'}</h2>
          <button type="button" className={s.iconBtn} onClick={onClose}>✕</button>
        </div>
        <label className={s.field}><span className={s.label}>Nome principal *</span>
          <input className={s.input} autoFocus placeholder="ex: Floating Card Effect" value={f.nomePrincipal} onChange={e => set('nomePrincipal', e.target.value)} /></label>
        <label className={s.field}><span className={s.label}>Sinônimos (separados por vírgula)</span>
          <input className={s.input} placeholder="ex: Elevated Card, Card flutuante" value={f.sinonimos} onChange={e => set('sinonimos', e.target.value)} /></label>
        <div className={s.field}><span className={s.label}>Categoria</span>
          <div className={s.catRow}>
            {PATTERN_CATEGORIES.map(c => (
              <button type="button" key={c} className={`${s.catChip} ${f.categoria === c ? s.catChipActive : ''}`} onClick={() => set('categoria', c)}>{c}</button>
            ))}
          </div>
        </div>
        <label className={s.field}><span className={s.label}>O que é * (1-2 frases)</span>
          <textarea className={`${s.input} ${s.textarea}`} rows={2} value={f.oQueE} onChange={e => set('oQueE', e.target.value)} /></label>
        <label className={s.field}><span className={s.label}>Como funciona</span>
          <textarea className={`${s.input} ${s.textarea}`} rows={4} placeholder="Um passo por linha" value={f.comoFunciona} onChange={e => set('comoFunciona', e.target.value)} /></label>
        <label className={s.field}><span className={s.label}>Onde usar</span>
          <input className={s.input} placeholder="ex: hero sections, botões de destaque" value={f.ondeUsar} onChange={e => set('ondeUsar', e.target.value)} /></label>
        <label className={s.field}><span className={s.label}>Tags (separadas por vírgula)</span>
          <input className={s.input} placeholder="ex: gradiente, hero, sidebar" value={f.tags} onChange={e => set('tags', e.target.value)} /></label>
        <div className={s.field}><span className={s.label}>Exemplo: imagem ou GIF</span>
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={onImage} />
          {f.exemploImagem ? (
            <div className={s.imgPreview}><img src={f.exemploImagem} alt="" />
              <button type="button" className={s.dangerBtn} onClick={() => set('exemploImagem', '')}>Remover</button></div>
          ) : (
            <button type="button" className={s.uploadBtn} onClick={() => imgRef.current?.click()}>Escolher imagem</button>
          )}
        </div>
        <label className={s.field}><span className={s.label}>Exemplo: código</span>
          <textarea className={`${s.input} ${s.textarea} ${s.mono}`} rows={4} placeholder=".card:hover { transform: translateY(-4px); }" value={f.exemploCodigo} onChange={e => set('exemploCodigo', e.target.value)} /></label>
        <div className={s.detailActions}>
          <button type="button" className={s.secondaryBtn} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.addBtn} disabled={!valid}>{isNew ? 'Salvar padrão' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  )
}
