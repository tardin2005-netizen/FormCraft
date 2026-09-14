import { useState, useEffect, useRef, useCallback } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import p from './PromptLibrary.module.css'
import DeleteBtn from './DeleteBtn'

interface PromptData {
  title: string
  objective: string
  context: string
  prompt: string
  tool: string
  category: string
  tags: string
  notes: string
  version: string
  imageData?: string
}

const TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'Flux', 'Stable Diffusion', 'Ideogram', 'Leonardo', 'v0.dev', 'Cursor', 'Outro']
const IMAGE_TOOLS = new Set(['Midjourney', 'DALL-E', 'Flux', 'Stable Diffusion', 'Ideogram', 'Leonardo'])

const EMPTY: PromptData = {
  title: '', objective: '', context: '', prompt: '', tool: 'Midjourney',
  category: '', tags: '', notes: '', version: 'v1', imageData: '',
}

type View = 'gallery' | 'list'

export default function PromptLibrary({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PromptData>({ ...EMPTY })
  const [copied, setCopied] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<View>('gallery')
  const [filterTool, setFilterTool] = useState<string>('todos')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  function set(patch: Partial<PromptData>) { setForm(prev => ({ ...prev, ...patch })) }

  // Paste image support in form
  useEffect(() => {
    if (!showForm) return
    function onPaste(e: ClipboardEvent) {
      const clipItems = e.clipboardData?.items
      if (!clipItems) return
      for (let i = 0; i < clipItems.length; i++) {
        if (clipItems[i].type.startsWith('image/')) {
          const file = clipItems[i].getAsFile()
          if (!file) continue
          const reader = new FileReader()
          reader.onload = ev => set({ imageData: ev.target?.result as string })
          reader.readAsDataURL(file)
          e.preventDefault()
          return
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [showForm])

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set({ imageData: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  function handleAdd() {
    if (!form.title.trim() || !form.prompt.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'prompts',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  function copyPrompt(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1800)
  }

  // Filter by tool
  const tools = [...new Set(items.map(i => (i.data as unknown as PromptData).tool).filter(Boolean))]
  const visible = filterTool === 'todos'
    ? items
    : items.filter(i => (i.data as unknown as PromptData).tool === filterTool)

  const hasImages = visible.some(i => !!(i.data as unknown as PromptData).imageData)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {items.length > 0 && (
            <>
              <button className={`${s.viewToggle} ${view === 'gallery' ? s.active : ''}`} onClick={() => setView('gallery')} title="Galeria">⊞</button>
              <button className={`${s.viewToggle} ${view === 'list' ? s.active : ''}`} onClick={() => setView('list')} title="Lista">≡</button>
            </>
          )}
          <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Novo prompt</button>
        </div>
      </div>

      {/* Tool filter */}
      {tools.length > 0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterTool === 'todos' ? s.active : ''}`} onClick={() => setFilterTool('todos')}>
            Todos
          </button>
          {tools.map(tool => (
            <button key={tool} className={`${s.filterBtn} ${filterTool === tool ? s.active : ''}`} onClick={() => setFilterTool(tool)}>
              {tool}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◈</div>
          <div className={s.emptyTitle}>Nenhum prompt salvo</div>
          <div className={s.emptyDesc}>Organize seus melhores prompts com ferramenta, objetivo e a imagem gerada.</div>
        </div>
      ) : view === 'gallery' ? (
        /* ── GALLERY VIEW ── */
        <div className={p.gallery}>
          {visible.map(item => {
            const d = item.data as unknown as PromptData
            const isImg = IMAGE_TOOLS.has(d.tool)
            return (
              <div key={item.id} className={`${p.galleryCard} ${item.starred ? p.starred : ''}`}>
                {/* Image area */}
                {d.imageData ? (
                  <div className={p.imgWrap} onClick={() => setLightbox(d.imageData!)}>
                    <img src={d.imageData} alt={d.title} className={p.img} />
                    <div className={p.imgOverlay}>
                      <span className={p.imgZoom}>↗</span>
                    </div>
                  </div>
                ) : (
                  <div className={p.imgPlaceholder}>
                    <span className={p.placeholderIcon}>{isImg ? '🖼' : '◈'}</span>
                  </div>
                )}

                {/* Card body */}
                <div className={p.cardBody}>
                  <div className={p.cardTop}>
                    <div className={p.cardTitle}>{d.title}</div>
                    <div className={p.cardActions}>
                      <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>
                        {item.starred ? '★' : '☆'}
                      </button>
                      <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    </div>
                  </div>

                  <div className={p.cardMeta}>
                    {d.tool && <span className={s.promptTool}>{d.tool}</span>}
                    {d.version && <span className={s.promptVersion}>{d.version}</span>}
                    {d.category && <span className={s.promptCategory}>{d.category}</span>}
                  </div>

                  {d.objective && (
                    <div className={p.objective}>{d.objective}</div>
                  )}

                  {/* Prompt block with copy */}
                  <div className={p.promptBlock}>
                    <div className={p.promptBlockHeader}>
                      <span className={p.promptBlockLabel}>Prompt</span>
                      <button className={s.copyPromptBtn} onClick={() => copyPrompt(d.prompt, item.id)}>
                        {copied === item.id ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className={p.promptText}>{d.prompt}</div>
                  </div>

                  {d.notes && <div className={p.notes}>{d.notes}</div>}

                  {item.tags.length > 0 && (
                    <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className={s.promptList}>
          {visible.map(item => {
            const d = item.data as unknown as PromptData
            const isOpen = expanded === item.id
            return (
              <div key={item.id} className={`${s.promptCard} ${item.starred ? s.starred : ''}`}>
                <div className={s.promptTop} onClick={() => setExpanded(isOpen ? null : item.id)}>
                  {d.imageData && (
                    <img src={d.imageData} alt={d.title} className={p.listThumb} onClick={e => { e.stopPropagation(); setLightbox(d.imageData!) }} />
                  )}
                  <div className={s.promptLeft}>
                    <div className={s.promptTitle}>{d.title}</div>
                    <div className={s.promptMeta}>
                      {d.tool && <span className={s.promptTool}>{d.tool}</span>}
                      {d.version && <span className={s.promptVersion}>{d.version}</span>}
                      {d.category && <span className={s.promptCategory}>{d.category}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={e => { e.stopPropagation(); toggleStar(item.id) }}>
                      {item.starred ? '★' : '☆'}
                    </button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    <span style={{ color: 'var(--text2)', fontSize: 12 }}>{isOpen ? '↑' : '↓'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className={s.promptBody}>
                    {d.objective && (
                      <div className={s.promptSection}>
                        <div className={s.promptSectionLabel}>Objetivo</div>
                        <div className={s.promptSectionText}>{d.objective}</div>
                      </div>
                    )}
                    {d.context && (
                      <div className={s.promptSection}>
                        <div className={s.promptSectionLabel}>Contexto</div>
                        <div className={s.promptSectionText}>{d.context}</div>
                      </div>
                    )}
                    <div className={s.promptSection}>
                      <div className={s.promptSectionLabel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Prompt
                        <button className={s.copyPromptBtn} onClick={() => copyPrompt(d.prompt, item.id)}>
                          {copied === item.id ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <div className={s.promptText}>{d.prompt}</div>
                    </div>
                    {d.imageData && (
                      <div className={s.promptSection}>
                        <div className={s.promptSectionLabel}>Resultado gerado</div>
                        <img
                          src={d.imageData}
                          alt="resultado"
                          className={p.resultImg}
                          onClick={() => setLightbox(d.imageData!)}
                        />
                      </div>
                    )}
                    {d.notes && (
                      <div className={s.promptSection}>
                        <div className={s.promptSectionLabel}>Observações</div>
                        <div className={s.promptSectionText}>{d.notes}</div>
                      </div>
                    )}
                    {item.tags.length > 0 && (
                      <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className={p.lightbox} onClick={() => setLightbox(null)}>
          <button className={p.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox} alt="resultado" className={p.lightboxImg} onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal} style={{ width: 600 }}>
            <h3 className={s.formTitle}>Novo prompt</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} placeholder="Nome descritivo do prompt..." value={form.title} onChange={e => set({ title: e.target.value })} autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Ferramenta</label>
                <select className={s.input} value={form.tool} onChange={e => set({ tool: e.target.value })}>
                  {TOOLS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Versão</label>
                <input className={s.input} placeholder="v1, v2..." value={form.version} onChange={e => set({ version: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Objetivo</label>
                <input className={s.input} placeholder="O que esse prompt faz..." value={form.objective} onChange={e => set({ objective: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <input className={s.input} placeholder="Imagem, UI, Copy, Código..." value={form.category} onChange={e => set({ category: e.target.value })} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Contexto / Variáveis</label>
                <textarea className={s.textarea} placeholder="Variáveis, parâmetros de uso..." value={form.context} onChange={e => set({ context: e.target.value })} rows={2} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Prompt *</label>
                <textarea className={s.textarea} style={{ minHeight: 100 }} placeholder="O prompt completo..." value={form.prompt} onChange={e => set({ prompt: e.target.value })} />
              </div>
              {/* Image upload */}
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Resultado gerado <span style={{ fontWeight: 400, textTransform: 'none', opacity: .7 }}>(cole ⌘V ou selecione)</span></label>
                {form.imageData ? (
                  <div className={p.formImgPreview}>
                    <img src={form.imageData} alt="" className={p.formImg} />
                    <button className={p.formImgRemove} onClick={() => set({ imageData: '' })}>✕ remover</button>
                  </div>
                ) : (
                  <div className={s.imageDrop} onClick={() => imgRef.current?.click()}>
                    <div>📋 Cole com ⌘V ou clique para selecionar a imagem gerada</div>
                    <div style={{ fontSize: 11, marginTop: 4, opacity: .6 }}>PNG, JPG, WebP</div>
                    <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
                  </div>
                )}
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="portrait, dark, cinematic" value={form.tags} onChange={e => set({ tags: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Observações</label>
                <input className={s.input} placeholder="Dicas, parâmetros extras, melhorias..." value={form.notes} onChange={e => set({ notes: e.target.value })} />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim() || !form.prompt.trim()}>Salvar prompt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
