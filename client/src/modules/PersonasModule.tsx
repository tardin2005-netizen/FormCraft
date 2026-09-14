import { useState, useRef } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './PersonasModule.module.css'
import DeleteBtn from './DeleteBtn'

interface PersonaData {
  title: string
  idade: string
  profissao: string
  renda: string
  localizacao: string
  motivacoes: string
  dores: string
  canais: string
  comportamento: string
  citacao: string
  imageData: string
}

const EMPTY: PersonaData = {
  title:'', idade:'', profissao:'', renda:'', localizacao:'',
  motivacoes:'', dores:'', canais:'', comportamento:'', citacao:'', imageData:'',
}

export default function PersonasModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PersonaData>({...EMPTY})
  const [expanded, setExpanded] = useState<string|null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  function set(patch: Partial<PersonaData>) { setForm(p=>({...p,...patch})) }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set({imageData: ev.target?.result as string})
    reader.readAsDataURL(file)
  }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'personas',
      data: form as unknown as Record<string,unknown>,
      tags: [form.profissao, form.localizacao].filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Nova persona</button>
      </div>

      {items.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◉</div>
          <div className={s.emptyTitle}>Nenhuma persona ainda</div>
          <div className={s.emptyDesc}>Crie perfis de público com motivações, dores e canais preferidos.</div>
        </div>
      ) : (
        <div className={d.grid}>
          {items.map(item=>{
            const data = item.data as unknown as PersonaData
            const isOpen = expanded===item.id
            return (
              <div key={item.id} className={`${d.card} ${item.starred?d.starred:''}`}>
                {/* Avatar */}
                <div className={d.avatar}>
                  {data.imageData
                    ? <img src={data.imageData} alt={data.title} className={d.avatarImg}/>
                    : <div className={d.avatarPlaceholder}>{data.title.charAt(0).toUpperCase()}</div>
                  }
                  <div className={d.avatarActions}>
                    <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={()=>toggleStar(item.id)}>{item.starred?'★':'☆'}</button>
                    <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                  </div>
                </div>

                {/* Core info */}
                <div className={d.name}>{data.title}</div>
                <div className={d.sub}>
                  {[data.profissao, data.idade?`${data.idade} anos`:'', data.localizacao].filter(Boolean).join(' · ')}
                </div>
                {data.renda && <div className={d.renda}>{data.renda}</div>}

                {/* Citação */}
                {data.citacao && <blockquote className={d.citacao}>"{data.citacao}"</blockquote>}

                {/* Canais */}
                {data.canais && (
                  <div className={d.canaisRow}>
                    {data.canais.split(',').map(c=>c.trim()).filter(Boolean).map(c=>(
                      <span key={c} className={d.canalPill}>{c}</span>
                    ))}
                  </div>
                )}

                {/* Expand toggle */}
                <button className={d.expandBtn} onClick={()=>setExpanded(isOpen?null:item.id)}>
                  {isOpen ? '↑ Ver menos' : '↓ Ver mais'}
                </button>

                {isOpen && (
                  <div className={d.expanded}>
                    {data.motivacoes && (
                      <div className={d.section}>
                        <div className={d.sectionLabel} style={{color:'#10b981'}}>Motivações</div>
                        <p className={d.sectionText}>{data.motivacoes}</p>
                      </div>
                    )}
                    {data.dores && (
                      <div className={d.section}>
                        <div className={d.sectionLabel} style={{color:'#f43f5e'}}>Dores</div>
                        <p className={d.sectionText}>{data.dores}</p>
                      </div>
                    )}
                    {data.comportamento && (
                      <div className={d.section}>
                        <div className={d.sectionLabel}>Comportamento</div>
                        <p className={d.sectionText}>{data.comportamento}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Nova persona</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome da persona *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Marina, a empreendedora" autoFocus/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Profissão</label>
                <input className={s.input} value={form.profissao} onChange={e=>set({profissao:e.target.value})} placeholder="Designer freelancer"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Idade</label>
                <input className={s.input} value={form.idade} onChange={e=>set({idade:e.target.value})} placeholder="28"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Renda</label>
                <input className={s.input} value={form.renda} onChange={e=>set({renda:e.target.value})} placeholder="R$ 4.000–8.000/mês"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Localização</label>
                <input className={s.input} value={form.localizacao} onChange={e=>set({localizacao:e.target.value})} placeholder="São Paulo, SP"/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Citação / Frase típica</label>
                <input className={s.input} value={form.citacao} onChange={e=>set({citacao:e.target.value})} placeholder='Quero mais tempo para o que importa'/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Canais favoritos</label>
                <input className={s.input} value={form.canais} onChange={e=>set({canais:e.target.value})} placeholder="Instagram, LinkedIn, WhatsApp"/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Motivações</label>
                <textarea className={s.textarea} value={form.motivacoes} onChange={e=>set({motivacoes:e.target.value})} rows={2} placeholder="O que move essa pessoa..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Dores</label>
                <textarea className={s.textarea} value={form.dores} onChange={e=>set({dores:e.target.value})} rows={2} placeholder="Frustrações, obstáculos, medos..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Comportamento</label>
                <textarea className={s.textarea} value={form.comportamento} onChange={e=>set({comportamento:e.target.value})} rows={2} placeholder="Hábitos digitais, rotina de consumo..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Foto / Ilustração</label>
                {form.imageData ? (
                  <div style={{position:'relative',display:'inline-block'}}>
                    <img src={form.imageData} alt="" style={{maxHeight:120,borderRadius:8,border:'1px solid var(--border)',display:'block'}}/>
                    <button onClick={()=>set({imageData:''})} style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,.6)',border:'none',color:'#fff',borderRadius:4,cursor:'pointer',padding:'2px 6px',fontSize:11}}>✕</button>
                  </div>
                ) : (
                  <div className={s.imageDrop} onClick={()=>imgRef.current?.click()}>
                    Clique para selecionar uma foto ou ilustração
                    <input ref={imgRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageFile}/>
                  </div>
                )}
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar persona</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
