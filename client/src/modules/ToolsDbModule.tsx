import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './ToolsDbModule.module.css'
import DeleteBtn from './DeleteBtn'

type Categoria = 'devops' | 'monitoramento' | 'seguranca' | 'banco-de-dados' | 'cloud' | 'ci-cd' | 'comunicacao' | 'produtividade' | 'dev' | 'design' | 'analytics' | 'outro'
type Plano = 'gratuito' | 'freemium' | 'pago' | 'open-source'

interface ToolData {
  title: string
  categoria: Categoria
  plano: Plano
  url: string
  descricao: string
  useCase: string
  preco: string
  alternativas: string
  rating: string
  notas: string
  tags: string
}

const CATS: { key: Categoria; label: string; color: string }[] = [
  { key:'devops', label:'DevOps', color:'#f59e0b' },
  { key:'monitoramento', label:'Monitoramento', color:'#10b981' },
  { key:'seguranca', label:'Segurança', color:'#f43f5e' },
  { key:'banco-de-dados', label:'Banco de dados', color:'#3b82f6' },
  { key:'cloud', label:'Cloud', color:'#06b6d4' },
  { key:'ci-cd', label:'CI/CD', color:'#8b5cf6' },
  { key:'comunicacao', label:'Comunicação', color:'#ec4899' },
  { key:'produtividade', label:'Produtividade', color:'#6366f1' },
  { key:'dev', label:'Desenvolvimento', color:'#f59e0b' },
  { key:'design', label:'Design', color:'#ec4899' },
  { key:'analytics', label:'Analytics', color:'#10b981' },
  { key:'outro', label:'Outro', color:'#6b7280' },
]

const PLANOS: { key: Plano; label: string; color: string }[] = [
  { key:'gratuito', label:'Gratuito', color:'#10b981' },
  { key:'freemium', label:'Freemium', color:'#f59e0b' },
  { key:'pago', label:'Pago', color:'#6b7280' },
  { key:'open-source', label:'Open Source', color:'#3b82f6' },
]

const EMPTY: ToolData = {
  title:'', categoria:'dev', plano:'gratuito', url:'', descricao:'',
  useCase:'', preco:'', alternativas:'', rating:'', notas:'', tags:'',
}

export default function ToolsDbModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ToolData>({...EMPTY})
  const [filterCat, setFilterCat] = useState<string>('todos')
  const [search, setSearch] = useState('')

  function set(patch: Partial<ToolData>) { setForm(p=>({...p,...patch})) }

  function handleAdd() {
    if (!form.title.trim()||!form.descricao.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'tools-db',
      data: form as unknown as Record<string,unknown>,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  const cats = [...new Set(items.map(i=>(i.data as unknown as ToolData).categoria).filter(Boolean))]

  let visible = items
  if(filterCat!=='todos') visible = visible.filter(i=>(i.data as unknown as ToolData).categoria===filterCat)
  if(search.trim()) {
    const q = search.toLowerCase()
    visible = visible.filter(i=>{
      const data = i.data as unknown as ToolData
      return data.title.toLowerCase().includes(q) || data.descricao.toLowerCase().includes(q) || i.tags.some(t=>t.toLowerCase().includes(q))
    })
  }

  function getRating(r: string) {
    const n = parseInt(r)
    if(isNaN(n)||n<1||n>5) return null
    return n
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input className={`${s.input} ${d.searchInput}`} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ferramenta..."/>
          <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Nova ferramenta</button>
        </div>
      </div>

      {cats.length>0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterCat==='todos'?s.active:''}`} onClick={()=>setFilterCat('todos')}>Todas</button>
          {cats.map(c=>{
            const ci = CATS.find(x=>x.key===c)
            return <button key={c} className={`${s.filterBtn} ${filterCat===c?s.active:''}`} onClick={()=>setFilterCat(c)}>{ci?.label||c}</button>
          })}
        </div>
      )}

      {visible.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>⚙</div>
          <div className={s.emptyTitle}>Nenhuma ferramenta ainda</div>
          <div className={s.emptyDesc}>Catalogue ferramentas com URL, preço, casos de uso e avaliação.</div>
        </div>
      ) : (
        <div className={d.grid}>
          {visible.map(item=>{
            const data = item.data as unknown as ToolData
            const catInfo = CATS.find(c=>c.key===data.categoria)
            const planoInfo = PLANOS.find(p=>p.key===data.plano)
            const rating = getRating(data.rating)
            return (
              <div key={item.id} className={`${d.card} ${item.starred?d.starred:''}`}>
                <div className={d.cardHeader}>
                  <div className={d.initial} style={catInfo?{background:`color-mix(in srgb,${catInfo.color} 15%,transparent)`,color:catInfo.color}:{}}>
                    {data.title.charAt(0).toUpperCase()}
                  </div>
                  <div className={d.cardActions}>
                    {rating && (
                      <div className={d.stars}>{Array.from({length:5},(_,i)=>(
                        <span key={i} style={{color:i<rating?'#f59e0b':'var(--border)',fontSize:10}}>★</span>
                      ))}</div>
                    )}
                    <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={()=>toggleStar(item.id)}>{item.starred?'★':'☆'}</button>
                    <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                  </div>
                </div>

                <div className={d.nameRow}>
                  <div className={d.name}>{data.title}</div>
                  {data.url && <a href={data.url} target="_blank" rel="noopener noreferrer" className={d.urlLink} onClick={e=>e.stopPropagation()}>↗</a>}
                </div>

                <div className={d.badges}>
                  {catInfo && <span className={d.catBadge} style={{background:`color-mix(in srgb,${catInfo.color} 12%,transparent)`,color:catInfo.color}}>{catInfo.label}</span>}
                  {planoInfo && <span className={d.planoBadge} style={{background:`color-mix(in srgb,${planoInfo.color} 10%,transparent)`,color:planoInfo.color}}>{planoInfo.label}</span>}
                  {data.preco && <span className={d.preco}>{data.preco}</span>}
                </div>

                <div className={d.desc}>{data.descricao}</div>

                {data.useCase && (
                  <div className={d.useCaseBlock}>
                    <div className={d.useCaseLabel}>Uso</div>
                    <div className={d.useCaseText}>{data.useCase}</div>
                  </div>
                )}

                {data.alternativas && (
                  <div className={d.altRow}>
                    <span className={d.altLabel}>Alt:</span>
                    {data.alternativas.split(',').map(a=>a.trim()).filter(Boolean).map(a=>(
                      <span key={a} className={d.altChip}>{a}</span>
                    ))}
                  </div>
                )}

                {item.tags.length>0 && (
                  <div className={s.tags}>{item.tags.map(t=><span key={t} className={s.tag}>#{t}</span>)}</div>
                )}

                {data.notas && <div className={d.notas}>{data.notas}</div>}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Nova ferramenta</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome da ferramenta *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Grafana, Datadog, Sentry" autoFocus/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select className={s.input} value={form.categoria} onChange={e=>set({categoria:e.target.value as Categoria})}>
                  {CATS.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Plano</label>
                <select className={s.input} value={form.plano} onChange={e=>set({plano:e.target.value as Plano})}>
                  {PLANOS.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>URL</label>
                <input className={s.input} value={form.url} onChange={e=>set({url:e.target.value})} placeholder="https://..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Preço</label>
                <input className={s.input} value={form.preco} onChange={e=>set({preco:e.target.value})} placeholder="$19/mês, Free até X usuários..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição *</label>
                <input className={s.input} value={form.descricao} onChange={e=>set({descricao:e.target.value})} placeholder="O que a ferramenta faz..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Caso de uso / Como usamos</label>
                <textarea className={s.textarea} value={form.useCase} onChange={e=>set({useCase:e.target.value})} rows={2} placeholder="Monitoramento de APIs em produção..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Alternativas</label>
                <input className={s.input} value={form.alternativas} onChange={e=>set({alternativas:e.target.value})} placeholder="Prometheus, New Relic, Zabbix"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Avaliação (1-5)</label>
                <select className={s.input} value={form.rating} onChange={e=>set({rating:e.target.value})}>
                  <option value="">—</option>
                  <option value="5">★★★★★ Excelente</option>
                  <option value="4">★★★★☆ Muito bom</option>
                  <option value="3">★★★☆☆ Bom</option>
                  <option value="2">★★☆☆☆ Regular</option>
                  <option value="1">★☆☆☆☆ Ruim</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e=>set({tags:e.target.value})} placeholder="observabilidade, gratuito, self-hosted"/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} value={form.notas} onChange={e=>set({notas:e.target.value})} rows={2} placeholder="Prós, contras, limitações..."/>
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()||!form.descricao.trim()}>Salvar ferramenta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
