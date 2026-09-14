import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspacesStore } from '../store/workspacesStore'
import { useContentItemsStore } from '../store/contentItemsStore'
import type { WorkspaceModule } from '../store/workspacesStore'
import FontLibrary from '../modules/FontLibrary'
import ColorLibrary from '../modules/ColorLibrary'
import ReferenceGallery from '../modules/ReferenceGallery'
import AnimationLibrary from '../modules/AnimationLibrary'
import PromptLibrary from '../modules/PromptLibrary'
import DisciplinesModule from '../modules/DisciplinesModule'
import AssignmentsModule from '../modules/AssignmentsModule'
import ExamsModule from '../modules/ExamsModule'
import CampaignsModule from '../modules/CampaignsModule'
import PersonasModule from '../modules/PersonasModule'
import CopywritingModule from '../modules/CopywritingModule'
import SocialModule from '../modules/SocialModule'
import MetricsModule from '../modules/MetricsModule'
import ScriptsModule from '../modules/ScriptsModule'
import TroubleshootingModule from '../modules/TroubleshootingModule'
import ToolsDbModule from '../modules/ToolsDbModule'
import GenericModule from '../modules/GenericModule'
import s from './WorkspaceView.module.css'

const CONTEXT_LABELS: Record<string, string> = {
  design: 'Design', faculdade: 'Faculdade', 'ux-ui': 'UX / UI',
  marketing: 'Marketing', ti: 'TI', ecommerce: 'E-commerce',
  projeto: 'Projeto', pesquisa: 'Pesquisa', custom: 'Personalizado',
}

function ModuleContent({ module, workspaceId }: { module: WorkspaceModule; workspaceId: string }) {
  const { items, addItem, removeItem, toggleStar } = useContentItemsStore()
  const moduleItems = items.filter(i => i.moduleId === module.id)

  const props = { module, workspaceId, items: moduleItems, addItem, removeItem, toggleStar }

  switch (module.type) {
    case 'fonts':          return <FontLibrary {...props} />
    case 'colors':         return <ColorLibrary {...props} />
    case 'references':
    case 'ui-inspiration': return <ReferenceGallery {...props} />
    case 'animations':     return <AnimationLibrary {...props} />
    case 'prompts':        return <PromptLibrary {...props} />
    case 'disciplines':      return <DisciplinesModule {...props} />
    case 'assignments':      return <AssignmentsModule {...props} />
    case 'exams':            return <ExamsModule {...props} />
    case 'campaigns':        return <CampaignsModule {...props} />
    case 'personas':         return <PersonasModule {...props} />
    case 'copywriting':      return <CopywritingModule {...props} />
    case 'social':           return <SocialModule {...props} />
    case 'metrics':          return <MetricsModule {...props} />
    case 'scripts':          return <ScriptsModule {...props} />
    case 'troubleshooting':  return <TroubleshootingModule {...props} />
    case 'tools-db':         return <ToolsDbModule {...props} />
    default:                 return <GenericModule {...props} />
  }
}

export default function WorkspaceView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { workspaces, setActive } = useWorkspacesStore()
  const { items } = useContentItemsStore()

  const ws = workspaces.find(w => w.id === id)
  const [activeModuleId, setActiveModuleId] = useState<string>('')

  useEffect(() => {
    if (ws) {
      setActive(ws.id)
      if (!activeModuleId && ws.modules.length > 0) {
        setActiveModuleId(ws.modules[0].id)
      }
    }
    return () => setActive(null)
  }, [ws?.id])

  if (!ws) {
    return (
      <div style={{ padding: 40, color: 'var(--text2)', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⬡</div>
        <div>Workspace não encontrado.</div>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          ← Voltar
        </button>
      </div>
    )
  }

  const sortedModules = [...ws.modules].sort((a, b) => a.order - b.order)
  const activeModule = sortedModules.find(m => m.id === activeModuleId) ?? sortedModules[0]

  function countForModule(modId: string) {
    return items.filter(i => i.moduleId === modId).length
  }

  return (
    <div className={s.page}>
      <div className={s.wsHeader}>
        <span className={s.wsIcon}>{ws.icon}</span>
        <span className={s.wsName}>{ws.name}</span>
        <span className={s.wsContext} style={{ background: `${ws.color}20`, color: ws.color }}>
          {CONTEXT_LABELS[ws.context] ?? ws.context}
        </span>
        <span className={s.wsSpacer} />
        <button className={s.wsMenu} onClick={() => navigate('/settings')}>Configurar</button>
      </div>

      <div className={s.moduleTabsWrap}>
        <div className={s.moduleTabs}>
          {sortedModules.map(m => (
            <button
              key={m.id}
              className={`${s.modTab} ${activeModule?.id === m.id ? s.active : ''}`}
              onClick={() => setActiveModuleId(m.id)}
            >
              <span className={s.modTabIcon}>{m.icon}</span>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className={s.moduleContent}>
        {activeModule?.type === 'overview' ? (
          <Overview ws={ws} modules={sortedModules} countFn={countForModule} onSelect={setActiveModuleId} />
        ) : activeModule ? (
          <ModuleContent module={activeModule} workspaceId={ws.id} />
        ) : null}
      </div>
    </div>
  )
}

function Overview({
  ws,
  modules,
  countFn,
  onSelect,
}: {
  ws: { name: string; color: string }
  modules: WorkspaceModule[]
  countFn: (id: string) => number
  onSelect: (id: string) => void
}) {
  const totalItems = modules.reduce((t, m) => t + countFn(m.id), 0)
  const nonOverview = modules.filter(m => m.type !== 'overview')

  return (
    <>
      <div className={s.overviewGrid}>
        <div className={s.overviewStat}>
          <div className={s.overviewNum} style={{ color: ws.color }}>{totalItems}</div>
          <div className={s.overviewLabel}>Itens salvos</div>
        </div>
        <div className={s.overviewStat}>
          <div className={s.overviewNum} style={{ color: ws.color }}>{nonOverview.length}</div>
          <div className={s.overviewLabel}>Módulos ativos</div>
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text2)', marginBottom: 10 }}>
        Módulos
      </div>
      <div className={s.overviewModules}>
        {nonOverview.map(m => (
          <button key={m.id} className={s.overviewModuleCard} onClick={() => onSelect(m.id)}>
            <span className={s.overviewModuleIcon}>{m.icon}</span>
            <span className={s.overviewModuleName}>{m.name}</span>
            <span className={s.overviewModuleCount}>{countFn(m.id) || '—'}</span>
          </button>
        ))}
      </div>
    </>
  )
}
