import { useParams } from 'react-router-dom'
import { useAreasStore } from '../store/areasStore'
import s from './AreaView.module.css'

const AREA_ITEMS: Record<string, { icon: string; title: string; type: string }[]> = {
  ux:        [{ icon:'🔗', title:'Figma Handbook', type:'link' }, { icon:'📄', title:'Nielsen Heuristics.pdf', type:'pdf' }, { icon:'📝', title:'Notas sobre usabilidade', type:'note' }],
  dev:       [{ icon:'🔗', title:'React Docs', type:'link' }, { icon:'🔗', title:'TypeScript Handbook', type:'link' }, { icon:'📝', title:'Snippets úteis', type:'note' }],
  faculdade: [{ icon:'📄', title:'Metodologia Científica.pdf', type:'pdf' }, { icon:'📝', title:'Rascunho do TCC', type:'note' }],
}

export default function AreaView() {
  const { id } = useParams<{ id: string }>()
  const { areas } = useAreasStore()
  const area  = areas.find(a => a.id === id)
  const items = AREA_ITEMS[id || ''] ?? []

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.areaTitle}>
          <span>{area?.emoji ?? '📁'}</span>
          <span>{area?.title ?? id}</span>
        </div>
        <span className={s.areaDesc}>{area?.desc}</span>
      </div>

      <div className={s.items}>
        {items.map((item, i) => (
          <div key={i} className={s.item}>
            <span className={s.itemIcon}>{item.icon}</span>
            <span className={s.itemTitle}>{item.title}</span>
            <span className={s.itemType}>{item.type}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className={s.empty}>Nenhum item nesta área ainda.</div>
        )}
      </div>
    </div>
  )
}
