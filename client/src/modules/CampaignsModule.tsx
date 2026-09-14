import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './CampaignsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Status = 'briefing' | 'execucao' | 'concluida' | 'pausada'
type Canal = 'Instagram' | 'LinkedIn' | 'TikTok' | 'YouTube' | 'Email' | 'Google Ads' | 'Meta Ads' | 'Twitter/X' | 'WhatsApp' | 'Blog' | 'Outro'

interface CampaignData {
  title: string
  objetivo: string
  publico: string
  canais: string
  status: Status
  inicio: string
  fim: string
  budget: string
  conceito: string
  metricas: string
  aprendizados: string
  tags: string
}

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: 'briefing',  label: 'Briefing',     color: '#6b7280' },
  { key: 'execucao',  label: 'Em execução',  color: '#f59e0b' },
  { key: 'concluida', label: 'Concluída',    color: '#10b981' },
  { key: 'pausada',   label: 'Pausada',      color: '#f43f5e' },
]

const CANAIS: Canal[] = ['Instagram','LinkedIn','TikTok','YouTube','Email','Google Ads','Meta Ads','Twitter/X','WhatsApp','Blog','Outro']

const EMPTY: CampaignData = {
  title:'', objetivo:'', publico:'', canais:'', status:'briefing',
  inicio:'', fim:'', budget:'', conceito:'', metricas:'', aprendizados:'', tags:'',
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})
}

export default function CampaignsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CampaignData>({...EMPTY})
  const [expanded, setExpanded] = useState<string|null>(null)

  function set(patch: Partial<CampaignData>) { setForm(p=>({...p,...patch})) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'campaigns',
      data: form as unknown as Record<string,unknown>,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  const byStatus = (st: Status) => items.filter(i=>(i.data as unknown as CampaignData).status===st)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Nova campanha</button>
      </div>

      {items.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◉</div>
          <div className={s.emptyTitle}>Nenhuma campanha ainda</div>
          <div className={s.emptyDesc}>Adicione campanhas com objetivo, público, canais e período.</div>
        </div>
      ) : (
        <div className={d.kanban}>
          {COLUMNS.map(col=>{
            const colItems = byStatus(col.key)
            return (
              <div key={col.key} className={d.column}>
                <div className={d.colHeader}>
                  <span className={d.colDot} style={{background:col.color}}/>
                  <span className={d.colLabel}>{col.label}</span>
                  <span className={d.colCount}>{colItems.length}</span>
                </div>
                <div className={d.colItems}>
                  {colItems.map(item=>{
                    const data = item.data as unknown as CampaignData
                    const isOpen = expanded===item.id
                    return (
                      <div key={item.id} className={`${d.card} ${item.starred?d.starred:''}`}>
                        <div className={d.cardTop} onClick={()=>setExpanded(isOpen?null:item.id)}>
                          <div className={d.cardTitle}>{data.title}</div>
                          <div className={d.cardActions}>
                            <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={e=>{e.stopPropagation();toggleStar(item.id)}}>{item.starred?'★':'☆'}</button>
                            <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                            <span className={d.chevron}>{isOpen?'↑':'↓'}</span>
                          </div>
                        </div>

                        {data.objetivo && <div className={d.objetivo}>{data.objetivo}</div>}

                        <div className={d.chips}>
                          {data.publico && <span className={d.chip}>{data.publico}</span>}
                          {data.canais && data.canais.split(',').map(c=>c.trim()).filter(Boolean).map(c=>(
                            <span key={c} className={d.canalChip}>{c}</span>
                          ))}
                        </div>

                        {(data.inicio||data.fim||data.budget) && (
                          <div className={d.meta}>
                            {(data.inicio||data.fim) && <span>{formatDate(data.inicio)}{data.fim?` → ${formatDate(data.fim)}`:''}</span>}
                            {data.budget && <span className={d.budget}>{data.budget}</span>}
                          </div>
                        )}

                        {isOpen && (data.conceito||data.metricas||data.aprendizados) && (
                          <div className={d.expanded}>
                            {data.conceito && <div className={d.expandSection}><span className={d.expandLabel}>Conceito</span><p className={d.expandText}>{data.conceito}</p></div>}
                            {data.metricas && <div className={d.expandSection}><span className={d.expandLabel}>Métricas / KPIs</span><p className={d.expandText}>{data.metricas}</p></div>}
                            {data.aprendizados && <div className={d.expandSection}><span className={d.expandLabel}>Aprendizados</span><p className={d.expandText}>{data.aprendizados}</p></div>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className={s.formModal} style={{width:600}}>
            <h3 className={s.formTitle}>Nova campanha</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome da campanha *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Lançamento Produto X" autoFocus/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Objetivo</label>
                <input className={s.input} value={form.objetivo} onChange={e=>set({objetivo:e.target.value})} placeholder="Aumentar vendas em 20%, gerar leads, brand awareness..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Público-alvo</label>
                <input className={s.input} value={form.publico} onChange={e=>set({publico:e.target.value})} placeholder="Mulheres 25-40, C/D..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e=>set({status:e.target.value as Status})}>
                  <option value="briefing">Briefing</option>
                  <option value="execucao">Em execução</option>
                  <option value="concluida">Concluída</option>
                  <option value="pausada">Pausada</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Canais</label>
                <input className={s.input} value={form.canais} onChange={e=>set({canais:e.target.value})} placeholder="Instagram, Meta Ads, Email"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Budget</label>
                <input className={s.input} value={form.budget} onChange={e=>set({budget:e.target.value})} placeholder="R$ 5.000"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Início</label>
                <input className={s.input} type="date" value={form.inicio} onChange={e=>set({inicio:e.target.value})}/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Fim</label>
                <input className={s.input} type="date" value={form.fim} onChange={e=>set({fim:e.target.value})}/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Conceito / Ideia criativa</label>
                <textarea className={s.textarea} value={form.conceito} onChange={e=>set({conceito:e.target.value})} rows={2} placeholder="A grande ideia por trás da campanha..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Métricas / KPIs</label>
                <input className={s.input} value={form.metricas} onChange={e=>set({metricas:e.target.value})} placeholder="CTR, CPC, conversões, alcance..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Aprendizados</label>
                <textarea className={s.textarea} value={form.aprendizados} onChange={e=>set({aprendizados:e.target.value})} rows={2} placeholder="O que funcionou, o que não funcionou..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e=>set({tags:e.target.value})} placeholder="branding, produto, sazonal"/>
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar campanha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
