import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './MetricsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Categoria = 'conversao' | 'alcance' | 'engajamento' | 'receita' | 'custo' | 'seo' | 'email' | 'outro'
type Tendencia = 'up' | 'down' | 'stable'

interface MetricData {
  title: string
  categoria: Categoria
  valor: string
  meta: string
  anterior: string
  tendencia: Tendencia
  periodo: string
  fonte: string
  notas: string
  tags: string
}

const CATEGORIAS: { key: Categoria; label: string; color: string }[] = [
  { key:'conversao', label:'Conversão', color:'#10b981' },
  { key:'alcance', label:'Alcance', color:'#3b82f6' },
  { key:'engajamento', label:'Engajamento', color:'#f59e0b' },
  { key:'receita', label:'Receita', color:'#10b981' },
  { key:'custo', label:'Custo', color:'#f43f5e' },
  { key:'seo', label:'SEO', color:'#8b5cf6' },
  { key:'email', label:'E-mail', color:'#ec4899' },
  { key:'outro', label:'Outro', color:'#6b7280' },
]

const TENDENCIAS: { key: Tendencia; icon: string; color: string }[] = [
  { key:'up', icon:'↑', color:'#10b981' },
  { key:'down', icon:'↓', color:'#f43f5e' },
  { key:'stable', icon:'→', color:'#6b7280' },
]

const EMPTY: MetricData = {
  title:'', categoria:'conversao', valor:'', meta:'', anterior:'',
  tendencia:'stable', periodo:'', fonte:'', notas:'', tags:'',
}

function calcProgress(valor: string, meta: string): number|null {
  const v = parseFloat(valor.replace(/[^\d.,]/g,'').replace(',','.'))
  const m = parseFloat(meta.replace(/[^\d.,]/g,'').replace(',','.'))
  if(isNaN(v)||isNaN(m)||m===0) return null
  return Math.min(100, Math.round((v/m)*100))
}

export default function MetricsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<MetricData>({...EMPTY})
  const [filterCat, setFilterCat] = useState<string>('todos')

  function set(patch: Partial<MetricData>) { setForm(p=>({...p,...patch})) }

  function handleAdd() {
    if (!form.title.trim()||!form.valor.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'metrics',
      data: form as unknown as Record<string,unknown>,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  const cats = [...new Set(items.map(i=>(i.data as unknown as MetricData).categoria).filter(Boolean))]
  const visible = filterCat==='todos' ? items : items.filter(i=>(i.data as unknown as MetricData).categoria===filterCat)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Nova métrica</button>
      </div>

      {cats.length>0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterCat==='todos'?s.active:''}`} onClick={()=>setFilterCat('todos')}>Todas</button>
          {cats.map(c=>{
            const ci = CATEGORIAS.find(x=>x.key===c)
            return <button key={c} className={`${s.filterBtn} ${filterCat===c?s.active:''}`} onClick={()=>setFilterCat(c)}>{ci?.label||c}</button>
          })}
        </div>
      )}

      {visible.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◈</div>
          <div className={s.emptyTitle}>Nenhuma métrica ainda</div>
          <div className={s.emptyDesc}>Registre KPIs com valor, meta e tendência para acompanhar resultados.</div>
        </div>
      ) : (
        <div className={d.grid}>
          {visible.map(item=>{
            const data = item.data as unknown as MetricData
            const catInfo = CATEGORIAS.find(c=>c.key===data.categoria)
            const tendInfo = TENDENCIAS.find(t=>t.key===data.tendencia)
            const progress = calcProgress(data.valor, data.meta)
            return (
              <div key={item.id} className={`${d.card} ${item.starred?d.starred:''}`}
                style={catInfo?{borderTop:`3px solid ${catInfo.color}`}:{}}>

                <div className={d.cardHeader}>
                  <div className={d.catBadge}
                    style={catInfo?{background:`color-mix(in srgb, ${catInfo.color} 10%, transparent)`,color:catInfo.color}:{}}>
                    {catInfo?.label||data.categoria}
                  </div>
                  <div className={d.cardActions}>
                    <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={()=>toggleStar(item.id)}>{item.starred?'★':'☆'}</button>
                    <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                  </div>
                </div>

                <div className={d.metricName}>{data.title}</div>

                <div className={d.valueRow}>
                  <div className={d.valor}>{data.valor}</div>
                  {tendInfo && (
                    <div className={d.tendencia} style={{color:tendInfo.color}}>
                      <span className={d.tendIcon}>{tendInfo.icon}</span>
                      {data.anterior && <span className={d.anterior}>{data.anterior}</span>}
                    </div>
                  )}
                </div>

                {data.meta && (
                  <div className={d.metaSection}>
                    <div className={d.metaRow}>
                      <span className={d.metaLabel}>Meta</span>
                      <span className={d.metaVal}>{data.meta}</span>
                      {progress!==null && <span className={d.progressPct}>{progress}%</span>}
                    </div>
                    {progress!==null && (
                      <div className={d.progressBar}>
                        <div className={d.progressFill}
                          style={{width:`${progress}%`,background:catInfo?.color||'var(--accent)'}}/>
                      </div>
                    )}
                  </div>
                )}

                <div className={d.footer}>
                  {data.periodo && <span className={d.period}>{data.periodo}</span>}
                  {data.fonte && <span className={d.fonte}>via {data.fonte}</span>}
                </div>

                {data.notas && <div className={d.notas}>{data.notas}</div>}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Nova métrica</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome da métrica *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Taxa de conversão, CPC, Alcance orgânico" autoFocus/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select className={s.input} value={form.categoria} onChange={e=>set({categoria:e.target.value as Categoria})}>
                  {CATEGORIAS.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tendência</label>
                <select className={s.input} value={form.tendencia} onChange={e=>set({tendencia:e.target.value as Tendencia})}>
                  <option value="up">↑ Subindo</option>
                  <option value="down">↓ Caindo</option>
                  <option value="stable">→ Estável</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Valor atual *</label>
                <input className={s.input} value={form.valor} onChange={e=>set({valor:e.target.value})} placeholder="2,4% / R$1.200 / 45.000"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Meta</label>
                <input className={s.input} value={form.meta} onChange={e=>set({meta:e.target.value})} placeholder="5% / R$2.000 / 80.000"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Valor anterior</label>
                <input className={s.input} value={form.anterior} onChange={e=>set({anterior:e.target.value})} placeholder="1,8%"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Período</label>
                <input className={s.input} value={form.periodo} onChange={e=>set({periodo:e.target.value})} placeholder="Julho 2025, Q2, Semana 28..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Fonte</label>
                <input className={s.input} value={form.fonte} onChange={e=>set({fonte:e.target.value})} placeholder="Google Analytics, Meta Ads..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} value={form.notas} onChange={e=>set({notas:e.target.value})} rows={2} placeholder="Contexto, mudanças, ações tomadas..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e=>set({tags:e.target.value})} placeholder="campanha, mensal, pago"/>
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()||!form.valor.trim()}>Salvar métrica</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
