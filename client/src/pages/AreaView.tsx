import { useParams, Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import s from './AreaView.module.css'

const AREA_DATA: Record<string, { emoji: string; title: string; items: { icon: string; title: string; type: string }[] }> = {
  ux: {
    emoji: '🎨', title: 'UX & Design',
    items: [
      { icon: '🔗', title: 'Figma Handbook', type: 'link' },
      { icon: '📄', title: 'Nielsen Heuristics.pdf', type: 'pdf' },
      { icon: '📝', title: 'Notas sobre usabilidade', type: 'note' },
      { icon: '🖼️', title: 'Moodboard Q1 2025', type: 'image' },
    ],
  },
  dev: {
    emoji: '💻', title: 'Desenvolvimento',
    items: [
      { icon: '🔗', title: 'React Docs', type: 'link' },
      { icon: '🔗', title: 'TypeScript Handbook', type: 'link' },
      { icon: '📝', title: 'Snippets úteis', type: 'note' },
    ],
  },
  faculdade: {
    emoji: '📚', title: 'Faculdade',
    items: [
      { icon: '📄', title: 'Metodologia Científica.pdf', type: 'pdf' },
      { icon: '📝', title: 'Rascunho do TCC', type: 'note' },
    ],
  },
}

export default function AreaView() {
  const { id } = useParams<{ id: string }>()
  const { theme, toggle } = useThemeStore()
  const area = AREA_DATA[id || ''] ?? { emoji: '📁', title: id, items: [] }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <Link to="/" className={s.back}>← Dashboard</Link>
          <div className={s.areaTitle}>
            <span>{area.emoji}</span>
            <span>{area.title}</span>
          </div>
        </div>
        <button className={s.themeBtn} onClick={toggle}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <div className={s.content}>
        <div className={s.items}>
          {area.items.map((item, i) => (
            <div key={i} className={s.item}>
              <span className={s.itemIcon}>{item.icon}</span>
              <span className={s.itemTitle}>{item.title}</span>
              <span className={s.itemType}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
