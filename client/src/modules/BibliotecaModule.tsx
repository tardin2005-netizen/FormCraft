import { useMemo, useRef, useState } from 'react'
import {
  useLibraryStore, PATTERN_CATEGORIES, DEFAULT_PATTERNS,
  type DesignPattern, type DesignPatternInput, type PatternCategory,
} from '../store/libraryStore'
import { normalize } from '../utils/globalSearch'
import { imageToDataUrl } from '../utils/imageData'
import RichText, { plainText } from '../components/RichText'
import PatternPreview from './PatternPreview'
import ToolTile from './ToolTile'
import RecommendPanel from './RecommendPanel'
import { ALL_TOOLS, type Tool } from '../data/tools'
import { useHubsStore } from '../store/hubsStore'
import { useHubToolsStore } from '../store/hubToolsStore'
import { toolsForHub, findTools } from '../utils/hubTools'
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

export default function BibliotecaModule({ hubId, isDesignHub }: { hubId: string; isDesignHub: boolean }) {
  const { patterns: allPatterns, addPattern, updatePattern, removePattern } = useLibraryStore()
  const patterns = useMemo(
    () => allPatterns.filter(p => p.hubId === hubId || (!p.hubId && isDesignHub)),
    [allPatterns, hubId, isDesignHub],
  )
  const hub = useHubsStore(st => st.hubs.find(h => h.id === hubId))
  const overrides = useHubToolsStore(st => st.overrides)
  const { addTool, removeTool } = useHubToolsStore()
  const [tab, setTab] = useState<'tudo' | 'padroes' | 'ferramentas'>('tudo')
  const [allCatalog, setAllCatalog] = useState(false)
  const [picker, setPicker] = useState(false)
  const [pickerQ, setPickerQ] = useState('')
  const hubTools = useMemo(() => (hub ? toolsForHub(hub, overrides) : []), [hub, overrides])
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

  const hasQuery = filter.trim().length > 0
  const toolPool = allCatalog ? ALL_TOOLS : hubTools
  const toolHits: Tool[] = useMemo(() => (hasQuery ? findTools(filter, toolPool) : toolPool), [filter, toolPool, hasQuery])
  const pickerList = useMemo(() => {
    const inHub = new Set(hubTools.map(x => x.name))
    return findTools(pickerQ, ALL_TOOLS.filter(x => !inHub.has(x.name)), 30)
  }, [pickerQ, hubTools])
  const recommend = hasQuery && tab === 'tudo'

  function handleSave(f: FormState) {
    const input = toInput(f)
    if (editing && editing !== 'new') updatePattern(editing.id, { ...input, hubId: editing.hubId })
    else addPattern({ ...input, hubId })
    setEditing(null)
  }

  const patternsGrid = visible.length === 0 ? (
    <div className={s.empty}>
      <div className={s.emptyIcon}>{patterns.length === 0 ? '📚' : '🔍'}</div>
      <div className={s.emptyTitle}>{patterns.length === 0 ? 'Nenhum padrão cadastrado' : 'Nenhum padrão com esse filtro'}</div>
      {patterns.length === 0 && (
        <>
          <div className={s.emptyDesc}>Esta biblioteca é só deste hub. Cadastre seus padrões ou comece com os padrões iniciais de design.</div>
          <button className={s.secondaryBtn} onClick={() => DEFAULT_PATTERNS.forEach(d => addPattern({ ...d, hubId }))}>Adicionar padrões iniciais</button>
        </>
      )}
    </div>
  ) : (
    <div className={s.grid}>
      {visible.map(p => (
        <button key={p.id} className={s.card} onClick={() => setDetail(p)}>
          <PatternPreview pattern={p} />
          <div className={s.cardBody}>
            <span className={s.cardCat}>{p.categoria}</span>
            <div className={s.cardTitle}>{p.nomePrincipal}</div>
            <div className={s.cardDef}>{plainText(p.oQueE)}</div>
          </div>
        </button>
      ))}
    </div>
  )

  const toolsGrid = toolHits.length === 0 ? (
    <div className={s.empty}>
      <div className={s.emptyIcon}>🧰</div>
      <div className={s.emptyTitle}>{hasQuery ? 'Nenhuma ferramenta combina' : 'Nenhuma ferramenta neste hub ainda'}</div>
      <div className={s.emptyDesc}>As ferramentas de cada hub são escolhidas por você. Adicione do catálogo de {ALL_TOOLS.length}.</div>
      <button className={s.secondaryBtn} onClick={() => setPicker(true)}>+ Ferramenta</button>
    </div>
  ) : (
    <div className={s.toolGrid}>
      {toolHits.map(tl => (
        <ToolTile key={tl.name} tool={tl} onRemoveFromHub={allCatalog ? undefined : () => removeTool(hubId, tl.name)} />
      ))}
    </div>
  )

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <h2 className={s.title}>Biblioteca</h2>
        <div className={s.headerBtns}>
          <button className={s.secondaryBtn} onClick={() => setPicker(true)}>+ Ferramenta</button>
          <button className={s.addBtn} onClick={() => setEditing('new')}>+ Padrão</button>
        </div>
      </div>

      <div className={s.tabs} role="tablist">
        {([['tudo', 'Tudo'], ['padroes', `Padrões · ${patterns.length}`], ['ferramentas', `Ferramentas · ${hubTools.length}`]] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`${s.tab} ${tab === k ? s.tabActive : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className={s.toolbar}>
        <input
          className={s.filterInput}
          placeholder="Busque ou descreva o que precisa: “preciso editar um vídeo”…"
          value={filter}
          onChange={e => { setFilter(e.target.value); setAllCatalog(false) }}
        />
        {tab !== 'ferramentas' && !recommend && (
          <div className={s.catRow}>
            {(['Todas', ...usedCats] as const).map(c => (
              <button key={c} className={`${s.catChip} ${cat === c ? s.catChipActive : ''}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {recommend ? (
        <RecommendPanel
          query={filter}
          tools={toolHits}
          patterns={visible}
          onOpenPattern={setDetail}
          onSearchAll={allCatalog ? undefined : () => setAllCatalog(true)}
        />
      ) : (
        <>
          {(tab === 'tudo' || tab === 'padroes') && (
            <section className={s.block}>
              {tab === 'tudo' && <h3 className={s.blockTitle}>Padrões <span>{visible.length}</span></h3>}
              {patternsGrid}
            </section>
          )}
          {(tab === 'tudo' || tab === 'ferramentas') && (
            <section className={s.block}>
              {tab === 'tudo' && <h3 className={s.blockTitle}>Ferramentas <span>{toolHits.length}</span></h3>}
              {toolsGrid}
            </section>
          )}
        </>
      )}

      {picker && (
        <div className={s.backdrop} onClick={() => setPicker(false)}>
          <div className={s.detail} onClick={e => e.stopPropagation()}>
            <div className={s.detailHead}>
              <h2 className={s.formTitle}>Adicionar ferramenta a este hub</h2>
              <button className={s.iconBtn} onClick={() => setPicker(false)} aria-label="Fechar">✕</button>
            </div>
            <input className={s.input} autoFocus placeholder="Buscar no catálogo…" value={pickerQ} onChange={e => setPickerQ(e.target.value)} />
            <div className={s.pickerList}>
              {pickerList.length === 0 && <div className={s.emptyDesc}>Todas as ferramentas que combinam já estão neste hub.</div>}
              {pickerList.map(tl => (
                <div key={tl.name} className={s.pickerRow}>
                  <span className={s.pickerLogo} style={{ background: tl.color }}>{tl.letter}</span>
                  <span className={s.pickerText}><strong>{tl.name}</strong><small>{tl.cat} · {tl.desc}</small></span>
                  <button className={s.secondaryBtn} onClick={() => addTool(hubId, tl.name)}>Adicionar</button>
                </div>
              ))}
            </div>
          </div>
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
            <PatternPreview pattern={detail} large />
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
