import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import vs from './VideoEffectsLibrary.module.css'
import DeleteBtn from './DeleteBtn'

interface VideoEffectData {
  name: string
  aliases: string
  description: string
  category: 'Transição' | 'Câmera' | 'Iluminação' | 'Pós-produção' | 'Áudio' | 'Outro'
  difficulty: 'Fácil' | 'Médio' | 'Avançado'
  howToShoot: string
  howToEdit: string
  useWhen: string
  tools: string
  prompt: string
  tags: string
}

const CATEGORY_COLOR: Record<string, string> = {
  'Transição':    '#7c6ef7',
  'Câmera':       '#3ecf8e',
  'Iluminação':   '#f59e0b',
  'Pós-produção': '#4f8ef7',
  'Áudio':        '#f43f5e',
  'Outro':        '#6b7280',
}

const DIFFICULTY_COLOR: Record<string, string> = {
  'Fácil':    '#10b981',
  'Médio':    '#f59e0b',
  'Avançado': '#f43f5e',
}

const WHIP_PAN_SEED: VideoEffectData = {
  name: 'Whip Pan',
  aliases: 'Swish Pan, Flash Pan',
  description: 'Movimento lateral ou vertical extremamente rápido da câmera que resulta em motion blur. Usado como transição dinâmica entre cenas, locais ou personagens.',
  category: 'Transição',
  difficulty: 'Fácil',
  howToShoot: '1. Filme o primeiro assunto normalmente e, ao final, mova a câmera rapidamente para um lado (esq. ou dir.).\n2. Repita variando a velocidade do movimento para ter opções na edição.\n3. Inicie o segundo take já com a câmera em movimento rápido, desacelerando até focar no novo objeto/cenário.',
  howToEdit: '1. Coloque os dois clipes na timeline (Premiere, DaVinci, editor mobile).\n2. Corte exatamente no meio do borrão (motion blur) de cada clipe.\n3. Ajuste desfoque se necessário.\n4. Adicione efeito sonoro de whoosh (vento/chiado) para reforçar a transição.',
  useWhen: 'Transições entre cenas, locais ou personagens diferentes. Adicionar dinamismo, tensão ou ritmo frenético. Conectar causa e efeito imediato entre duas ações.',
  tools: 'Qualquer câmera. Edição: Adobe Premiere, DaVinci Resolve, CapCut ou editores mobile.',
  prompt: '"Crie uma transição de Whip Pan entre [cena A] e [cena B] para transmitir energia e ritmo acelerado."',
  tags: 'transição, câmera, motion blur, dinâmico, ritmo',
}

const EMPTY_FORM: VideoEffectData = {
  name: '', aliases: '', description: '',
  category: 'Transição', difficulty: 'Fácil',
  howToShoot: '', howToEdit: '', useWhen: '',
  tools: '', prompt: '', tags: '',
}

export default function VideoEffectsLibrary({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<VideoEffectData>(EMPTY_FORM)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function copyPrompt(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1800)
  }

  function handleAdd() {
    if (!form.name.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'video-effects',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm(EMPTY_FORM)
  }

  function seedWhipPan() {
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'video-effects',
      data: WHIP_PAN_SEED as unknown as Record<string, unknown>,
      tags: WHIP_PAN_SEED.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => { setForm(EMPTY_FORM); setShowForm(true) }}>+ Adicionar</button>
      </div>

      {items.length === 0 ? (
        <div className={vs.emptyState}>
          <div className={vs.emptyIcon}>🎬</div>
          <div className={vs.emptyTitle}>Nenhum efeito de vídeo registrado</div>
          <div className={vs.emptyDesc}>Documente técnicas cinematográficas com como gravar, como editar e prompts prontos.</div>
          <div className={vs.emptySuggestion}>
            <div className={vs.suggestionLabel}>Sugestão para começar</div>
            <div className={vs.suggestionCard}>
              <div className={vs.suggestionName}>Whip Pan</div>
              <div className={vs.suggestionDesc}>Transição dinâmica por movimento rápido de câmera com motion blur.</div>
              <button className={vs.suggestionBtn} onClick={seedWhipPan}>+ Adicionar ao meu kit</button>
            </div>
          </div>
        </div>
      ) : (
        <div className={vs.effectsGrid}>
          {items.map(item => {
            const d = item.data as unknown as VideoEffectData
            const expanded = expandedId === item.id
            return (
              <div key={item.id} className={`${vs.effectCard} ${item.starred ? vs.starred : ''}`}>
                {/* Card header */}
                <div className={vs.cardTop}>
                  <div className={vs.cardBadges}>
                    <span className={vs.badge} style={{ background: `${CATEGORY_COLOR[d.category] ?? '#6b7280'}22`, color: CATEGORY_COLOR[d.category] ?? '#6b7280' }}>
                      {d.category}
                    </span>
                    <span className={vs.badge} style={{ background: `${DIFFICULTY_COLOR[d.difficulty] ?? '#6b7280'}22`, color: DIFFICULTY_COLOR[d.difficulty] ?? '#6b7280' }}>
                      {d.difficulty}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>
                      {item.starred ? '★' : '☆'}
                    </button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                  </div>
                </div>

                {/* Name + aliases */}
                <div className={vs.effectName}>{d.name}</div>
                {d.aliases && <div className={vs.effectAliases}>também chamado: {d.aliases}</div>}
                {d.description && <div className={vs.effectDesc}>{d.description}</div>}

                {/* Use when */}
                {d.useWhen && (
                  <div className={vs.infoBlock}>
                    <div className={vs.infoLabel} style={{ color: '#10b981' }}>✓ Quando usar</div>
                    <div className={vs.infoText}>{d.useWhen}</div>
                  </div>
                )}

                {/* Expandable: how to shoot + edit + tools + prompt */}
                <button className={vs.expandBtn} onClick={() => setExpandedId(expanded ? null : item.id)}>
                  {expanded ? '▲ Menos detalhes' : '▼ Ver como fazer'}
                </button>

                {expanded && (
                  <div className={vs.expandedContent}>
                    {d.howToShoot && (
                      <div className={vs.infoBlock}>
                        <div className={vs.infoLabel} style={{ color: '#4f8ef7' }}>📷 Como gravar</div>
                        <div className={vs.infoText} style={{ whiteSpace: 'pre-line' }}>{d.howToShoot}</div>
                      </div>
                    )}
                    {d.howToEdit && (
                      <div className={vs.infoBlock}>
                        <div className={vs.infoLabel} style={{ color: '#7c6ef7' }}>✂️ Como editar</div>
                        <div className={vs.infoText} style={{ whiteSpace: 'pre-line' }}>{d.howToEdit}</div>
                      </div>
                    )}
                    {d.tools && (
                      <div className={vs.infoBlock}>
                        <div className={vs.infoLabel} style={{ color: '#f59e0b' }}>🛠️ Ferramentas</div>
                        <div className={vs.infoText}>{d.tools}</div>
                      </div>
                    )}
                    {d.prompt && (
                      <div className={vs.promptBlock}>
                        <div className={vs.promptLabel}>
                          Prompt de IA
                          <button className={vs.copyBtn} onClick={() => copyPrompt(d.prompt, item.id)}>
                            {copied === item.id ? '✓ Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <div className={vs.promptText}>"{d.prompt}"</div>
                      </div>
                    )}
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
            <h3 className={s.formTitle}>Adicionar efeito de vídeo</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.label}>Nome *</label>
                <input className={s.input} placeholder="Whip Pan, Rack Focus, J-Cut..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select className={s.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as VideoEffectData['category'] }))}>
                  <option>Transição</option>
                  <option>Câmera</option>
                  <option>Iluminação</option>
                  <option>Pós-produção</option>
                  <option>Áudio</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Dificuldade</label>
                <select className={s.input} value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value as VideoEffectData['difficulty'] }))}>
                  <option>Fácil</option>
                  <option>Médio</option>
                  <option>Avançado</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Outros nomes</label>
                <input className={s.input} placeholder="Swish Pan, Flash Pan..." value={form.aliases} onChange={e => setForm(p => ({ ...p, aliases: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição</label>
                <input className={s.input} placeholder="O que é esse efeito e como funciona..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Quando usar</label>
                <textarea className={s.textarea} placeholder="Cenários e contextos ideais..." value={form.useWhen} onChange={e => setForm(p => ({ ...p, useWhen: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Como gravar</label>
                <textarea className={s.textarea} placeholder="Passo a passo para capturar..." value={form.howToShoot} onChange={e => setForm(p => ({ ...p, howToShoot: e.target.value }))} rows={4} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Como editar</label>
                <textarea className={s.textarea} placeholder="Passo a passo na edição..." value={form.howToEdit} onChange={e => setForm(p => ({ ...p, howToEdit: e.target.value }))} rows={4} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Ferramentas necessárias</label>
                <input className={s.input} placeholder="Câmera, Premiere, DaVinci, CapCut..." value={form.tools} onChange={e => setForm(p => ({ ...p, tools: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Prompt de IA</label>
                <textarea className={s.textarea} placeholder='"Aplique um efeito de Whip Pan entre..."' value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="transição, câmera, motion blur" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.name.trim()}>Salvar efeito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
