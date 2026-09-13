import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
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
}

export default function PromptLibrary({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PromptData>({
    title: '', objective: '', context: '', prompt: '', tool: 'ChatGPT',
    category: '', tags: '', notes: '', version: 'v1',
  })
  const [copied, setCopied] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  function copyPrompt(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1800)
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
    setForm({ title: '', objective: '', context: '', prompt: '', tool: 'ChatGPT', category: '', tags: '', notes: '', version: 'v1' })
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Novo prompt</button>
      </div>

      {items.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◈</div>
          <div className={s.emptyTitle}>Nenhum prompt salvo</div>
          <div className={s.emptyDesc}>Organize seus melhores prompts com objetivo, contexto, ferramenta e resultado.</div>
        </div>
      ) : (
        <div className={s.promptList}>
          {items.map(item => {
            const d = item.data as unknown as PromptData
            const isOpen = expanded === item.id
            return (
              <div key={item.id} className={`${s.promptCard} ${item.starred ? s.starred : ''}`}>
                <div className={s.promptTop} onClick={() => setExpanded(isOpen ? null : item.id)}>
                  <div className={s.promptLeft}>
                    <div className={s.promptTitle}>{d.title}</div>
                    <div className={s.promptMeta}>
                      {d.tool && <span className={s.promptTool}>{d.tool}</span>}
                      {d.version && <span className={s.promptVersion}>{d.version}</span>}
                      {d.category && <span className={s.promptCategory}>{d.category}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={e => { e.stopPropagation(); toggleStar(item.id) }}>{item.starred ? '★' : '☆'}</button>
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

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Novo prompt</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} placeholder="Nome descritivo do prompt..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Ferramenta</label>
                <select className={s.input} value={form.tool} onChange={e => setForm(p => ({ ...p, tool: e.target.value }))}>
                  <option>ChatGPT</option><option>Claude</option><option>Gemini</option>
                  <option>Midjourney</option><option>DALL-E</option><option>Stable Diffusion</option>
                  <option>v0.dev</option><option>Cursor</option><option>Outro</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Versão</label>
                <input className={s.input} placeholder="v1, v2..." value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Objetivo</label>
                <input className={s.input} placeholder="O que esse prompt faz..." value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <input className={s.input} placeholder="Animação, UI, Copy, Código..." value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Contexto</label>
                <textarea className={s.textarea} placeholder="Contexto de uso, variáveis, etc..." value={form.context} onChange={e => setForm(p => ({ ...p, context: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Prompt *</label>
                <textarea className={s.textarea} style={{ minHeight: 100 }} placeholder="O prompt completo..." value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="animation, ui, copy, code" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Observações</label>
                <input className={s.input} placeholder="Dicas, resultados, melhorias..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
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
