import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CONTEXT_TEMPLATES,
  type WorkspaceContext,
  type ModuleTemplate,
} from '../data/contextTemplates'
import { useWorkspacesStore } from '../store/workspacesStore'
import type { WorkspaceModule } from '../store/workspacesStore'
import s from './WorkspaceCreator.module.css'

interface Props {
  onClose: () => void
}

export default function WorkspaceCreator({ onClose }: Props) {
  const navigate = useNavigate()
  const { addWorkspace } = useWorkspacesStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedContext, setSelectedContext] = useState<WorkspaceContext | null>(null)
  const [wsName, setWsName] = useState('')
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())

  function handleSelectContext(context: WorkspaceContext) {
    const template = CONTEXT_TEMPLATES.find(t => t.context === context)!
    setSelectedContext(context)
    setWsName(template.label)
    const suggested = new Set(template.modules.filter(m => m.suggested).map(m => m.type))
    setSelectedModules(suggested)
    setStep(2)
  }

  function toggleModule(type: string) {
    setSelectedModules(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (type === 'overview') return prev
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  function handleCreate() {
    if (!selectedContext || !wsName.trim()) return
    const template = CONTEXT_TEMPLATES.find(t => t.context === selectedContext)!

    const modules: WorkspaceModule[] = template.modules
      .filter(m => selectedModules.has(m.type))
      .map((m, i) => ({
        id: `mod-${crypto.randomUUID()}`,
        type: m.type,
        name: m.name,
        icon: m.icon,
        order: i,
        enabled: true,
        layout: m.layout,
      }))

    if (!modules.find(m => m.type === 'overview')) {
      const ovMod = template.modules.find(m => m.type === 'overview')
      if (ovMod) {
        modules.unshift({
          id: `mod-${crypto.randomUUID()}`,
          type: ovMod.type,
          name: ovMod.name,
          icon: ovMod.icon,
          order: -1,
          enabled: true,
          layout: ovMod.layout,
        })
      }
    }

    const ws = addWorkspace({
      name: wsName.trim(),
      context: selectedContext,
      icon: template.icon,
      color: template.color,
      modules,
    })

    onClose()
    navigate(`/workspace/${ws.id}`)
  }

  const currentTemplate = selectedContext
    ? CONTEXT_TEMPLATES.find(t => t.context === selectedContext)
    : null

  return (
    <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={s.modal}>
        <div className={s.header}>
          <div className={s.step}>
            <div className={`${s.stepDot} ${step === 1 ? s.active : ''}`} />
            <div className={`${s.stepDot} ${step === 2 ? s.active : ''}`} />
          </div>
          {step === 1 ? (
            <>
              <div className={s.title}>O que você quer organizar?</div>
              <div className={s.sub}>Escolha um contexto — o FormCraft monta o workspace para você.</div>
            </>
          ) : (
            <>
              <div className={s.title}>Configure seu workspace</div>
              <div className={s.sub}>Escolha os módulos para começar. Você pode adicionar mais depois.</div>
            </>
          )}
        </div>

        <div className={s.body}>
          {step === 1 && (
            <div className={s.contextGrid}>
              {CONTEXT_TEMPLATES.map(t => (
                <button
                  key={t.context}
                  className={`${s.contextCard} ${selectedContext === t.context ? s.selected : ''}`}
                  onClick={() => handleSelectContext(t.context)}
                  style={{ '--accent': t.color, '--accent-m': `${t.color}20` } as React.CSSProperties}
                >
                  <div className={s.contextIcon}>{t.icon}</div>
                  <div className={s.contextLabel}>{t.label}</div>
                  <div className={s.contextDesc}>{t.description}</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && currentTemplate && (
            <>
              <input
                className={s.wsNameInput}
                value={wsName}
                onChange={e => setWsName(e.target.value)}
                placeholder="Nome do workspace..."
                autoFocus
              />
              <div className={s.modulesLabel}>Módulos disponíveis</div>
              <div className={s.modulesList}>
                {currentTemplate.modules.map((m: ModuleTemplate) => {
                  const isChecked = selectedModules.has(m.type)
                  const isLocked = m.type === 'overview'
                  return (
                    <div
                      key={m.type}
                      className={`${s.moduleRow} ${isChecked ? s.checked : ''}`}
                      onClick={() => !isLocked && toggleModule(m.type)}
                    >
                      <div className={s.moduleCheck}>{isChecked ? '✓' : ''}</div>
                      <span className={s.moduleIcon}>{m.icon}</span>
                      <span className={s.moduleName}>{m.name}</span>
                      <span className={s.moduleDesc}>{m.description}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className={s.footer}>
          <div className={s.footerLeft}>
            <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
            {step === 2 && (
              <button className={s.backBtn} onClick={() => setStep(1)}>← Voltar</button>
            )}
          </div>
          {step === 2 && (
            <button
              className={s.nextBtn}
              onClick={handleCreate}
              disabled={!wsName.trim() || selectedModules.size === 0}
            >
              Criar workspace →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
