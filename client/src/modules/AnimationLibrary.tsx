import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'

interface AnimationData {
  name: string
  description: string
  duration: string
  easing: string
  useWhen: string
  avoidWhen: string
  intensity: 'sutil' | 'médio' | 'forte'
  prompt: string
  tags: string
}

const INTENSITY_COLOR: Record<string, string> = {
  sutil: '#10b981', médio: '#f59e0b', forte: '#f43f5e',
}

export default function AnimationLibrary({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AnimationData>({
    name: '', description: '', duration: '0.4s – 0.8s', easing: 'ease-out',
    useWhen: '', avoidWhen: '', intensity: 'sutil', prompt: '', tags: '',
  })
  const [copied, setCopied] = useState<string | null>(null)

  function copyPrompt(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  function handleAdd() {
    if (!form.name.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'animations',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ name: '', description: '', duration: '0.4s – 0.8s', easing: 'ease-out', useWhen: '', avoidWhen: '', intensity: 'sutil', prompt: '', tags: '' })
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar</button>
      </div>

      {items.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◎</div>
          <div className={s.emptyTitle}>Nenhuma animação registrada</div>
          <div className={s.emptyDesc}>Documente animações de interface com timing, easing, quando usar e prompts prontos.</div>
        </div>
      ) : (
        <div className={s.animGrid}>
          {items.map(item => {
            const d = item.data as unknown as AnimationData
            return (
              <div key={item.id} className={`${s.animCard} ${item.starred ? s.starred : ''}`}>
                <div className={s.animHeader}>
                  <div>
                    <div className={s.animName}>{d.name}</div>
                    {d.description && <div className={s.animDesc}>{d.description}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                    <span className={s.intensityBadge} style={{ background: `${INTENSITY_COLOR[d.intensity]}20`, color: INTENSITY_COLOR[d.intensity] }}>{d.intensity}</span>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                    <button className={s.removeBtn} onClick={() => removeItem(item.id)}>×</button>
                  </div>
                </div>

                <div className={s.animMeta}>
                  {d.duration && (
                    <div className={s.animMetaItem}>
                      <span className={s.animMetaLabel}>Duration</span>
                      <span className={s.animMetaVal}>{d.duration}</span>
                    </div>
                  )}
                  {d.easing && (
                    <div className={s.animMetaItem}>
                      <span className={s.animMetaLabel}>Easing</span>
                      <span className={s.animMetaVal}>{d.easing}</span>
                    </div>
                  )}
                </div>

                {d.useWhen && (
                  <div className={s.animSection}>
                    <div className={s.animSectionLabel} style={{ color: '#10b981' }}>✓ Use quando</div>
                    <div className={s.animSectionText}>{d.useWhen}</div>
                  </div>
                )}

                {d.avoidWhen && (
                  <div className={s.animSection}>
                    <div className={s.animSectionLabel} style={{ color: '#f43f5e' }}>✕ Evite quando</div>
                    <div className={s.animSectionText}>{d.avoidWhen}</div>
                  </div>
                )}

                {d.prompt && (
                  <div className={s.animPrompt}>
                    <div className={s.animPromptLabel}>
                      Prompt
                      <button className={s.copyPromptBtn} onClick={() => copyPrompt(d.prompt, item.id)}>
                        {copied === item.id ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className={s.animPromptText}>"{d.prompt}"</div>
                  </div>
                )}

                {item.tags.length > 0 && (
                  <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Adicionar animação</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.label}>Nome *</label>
                <input className={s.input} placeholder="Fade In, Slide Up, Scale..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Intensidade</label>
                <select className={s.input} value={form.intensity} onChange={e => setForm(p => ({ ...p, intensity: e.target.value as AnimationData['intensity'] }))}>
                  <option value="sutil">Sutil</option>
                  <option value="médio">Médio</option>
                  <option value="forte">Forte</option>
                </select>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição</label>
                <input className={s.input} placeholder="O que essa animação faz..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Duration</label>
                <input className={s.input} placeholder="0.4s – 0.8s" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Easing</label>
                <input className={s.input} placeholder="ease-out, cubic-bezier(...)..." value={form.easing} onChange={e => setForm(p => ({ ...p, easing: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Use quando</label>
                <textarea className={s.textarea} placeholder="Cenários ideais para usar..." value={form.useWhen} onChange={e => setForm(p => ({ ...p, useWhen: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Evite quando</label>
                <textarea className={s.textarea} placeholder="Quando não usar..." value={form.avoidWhen} onChange={e => setForm(p => ({ ...p, avoidWhen: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Prompt de IA</label>
                <textarea className={s.textarea} placeholder='"Adicione uma animação de fade-in suave..."' value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="minimal, entrance, loading" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.name.trim()}>Salvar animação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
