import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import DeleteBtn from './DeleteBtn'

interface ColorData {
  name: string
  hex: string
  tags: string
  notes: string
  group: string
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return isNaN(r) ? null : { r, g, b }
}

function generateScale(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return []
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  return steps.map(step => {
    const t = step <= 500 ? (500 - step) / 500 : (step - 500) / 500
    const mix = step <= 500 ? 255 : 0
    const r = Math.round(rgb.r + (mix - rgb.r) * (step <= 500 ? t * 0.8 : t * 0.6))
    const g = Math.round(rgb.g + (mix - rgb.g) * (step <= 500 ? t * 0.8 : t * 0.6))
    const b = Math.round(rgb.b + (mix - rgb.b) * (step <= 500 ? t * 0.8 : t * 0.6))
    const toHex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  })
}

function isLight(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 128
}

export default function ColorLibrary({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [showScale, setShowScale] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState<ColorData>({ name: '', hex: '#7c6ef7', tags: '', notes: '', group: '' })

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex).catch(() => {})
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
  }

  function handleAdd() {
    if (!form.name.trim() || !form.hex) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'colors',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ name: '', hex: '#7c6ef7', tags: '', notes: '', group: '' })
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar cor</button>
      </div>

      {items.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◉</div>
          <div className={s.emptyTitle}>Nenhuma cor salva</div>
          <div className={s.emptyDesc}>Adicione cores para construir sua paleta pessoal com HEX, RGB e escalas tonais.</div>
        </div>
      ) : (
        <div className={s.colorsGrid}>
          {items.map(item => {
            const d = item.data as unknown as ColorData
            const light = isLight(d.hex)
            const scale = generateScale(d.hex)
            const rgb = hexToRgb(d.hex)
            return (
              <div key={item.id} className={`${s.colorCard} ${item.starred ? s.starred : ''}`}>
                <div
                  className={s.colorSwatch}
                  style={{ background: d.hex }}
                  onClick={() => copyHex(d.hex)}
                  title="Clique para copiar HEX"
                >
                  <div className={s.colorSwatchOverlay} style={{ color: light ? '#111' : '#fff' }}>
                    {copied === d.hex ? '✓ Copiado' : d.hex.toUpperCase()}
                  </div>
                </div>

                <div className={s.colorInfo}>
                  <div className={s.colorTopRow}>
                    <span className={s.colorName}>{d.name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                      <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    </div>
                  </div>

                  {rgb && (
                    <div className={s.colorValues}>
                      <span className={s.colorVal} onClick={() => copyHex(d.hex)}>{d.hex.toUpperCase()}</span>
                      <span className={s.colorVal}>rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
                    </div>
                  )}

                  {item.tags.length > 0 && (
                    <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                  )}

                  {d.notes && <div className={s.notes}>"{d.notes}"</div>}

                  <button
                    className={s.scaleToggle}
                    onClick={() => setShowScale(showScale === item.id ? null : item.id)}
                  >
                    {showScale === item.id ? '↑ Ocultar escala' : '↓ Ver escala 50–900'}
                  </button>

                  {showScale === item.id && (
                    <div className={s.colorScale}>
                      {[50,100,200,300,400,500,600,700,800,900].map((step, i) => (
                        <div
                          key={step}
                          className={s.scaleStep}
                          style={{ background: scale[i] }}
                          onClick={() => copyHex(scale[i])}
                          title={`${step}: ${scale[i]}`}
                        >
                          <span style={{ color: isLight(scale[i]) ? '#111' : '#fff', fontSize: 9 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Adicionar cor</h3>
            <div className={s.colorPickerPreview} style={{ background: form.hex }}>
              <span style={{ color: isLight(form.hex) ? '#111' : '#fff' }}>{form.hex.toUpperCase()}</span>
            </div>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.label}>Nome *</label>
                <input className={s.input} placeholder="Primary Blue, Accent Violet..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>HEX *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" className={s.colorInput} value={form.hex} onChange={e => setForm(p => ({ ...p, hex: e.target.value }))} />
                  <input className={s.input} placeholder="#7c6ef7" value={form.hex} onChange={e => setForm(p => ({ ...p, hex: e.target.value }))} />
                </div>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Grupo</label>
                <input className={s.input} placeholder="Brand, UI, Neutrals..." value={form.group} onChange={e => setForm(p => ({ ...p, group: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="primary, accent, brand" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} placeholder="Quando usar, contexto, projetos..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.name.trim()}>Salvar cor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
