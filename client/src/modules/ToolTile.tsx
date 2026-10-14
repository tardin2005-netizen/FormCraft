import { PRICING_COLOR, PRICING_LABEL, type Tool } from '../data/tools'
import { useSavedToolsStore } from '../store/savedToolsStore'
import type { Hub } from '../store/hubsStore'
import s from './ToolTile.module.css'
import Glyph from '../components/Glyph'

interface Props {
  tool: Tool
  hubs?: Hub[]
  reason?: string
  onRemoveFromHub?: () => void
}

export default function ToolTile({ tool, hubs, reason, onRemoveFromHub }: Props) {
  const { isSaved, saveTool, unsaveTool } = useSavedToolsStore()
  const saved = isSaved(tool.name)
  return (
    <div className={s.tile}>
      <div className={s.head}>
        <div className={s.logo} style={{ background: tool.color }}>{tool.letter}</div>
        <div className={s.names}>
          <span className={s.name}>{tool.name}</span>
          <span className={s.cat}>{tool.cat}</span>
        </div>
      </div>
      <div className={s.desc}>{reason ?? tool.desc}</div>
      <div className={s.chips}>
        <span className={s.chip} style={{ color: PRICING_COLOR[tool.pricing] }}>{PRICING_LABEL[tool.pricing]}</span>
        {hubs?.map(h => <span key={h.id} className={`${s.chip} ${s.hubChip}`}><Glyph value={h.emoji} size={12} /> {h.name}</span>)}
      </div>
      <div className={s.actions}>
        <a className={s.open} href={tool.url} target="_blank" rel="noopener noreferrer">Abrir {tool.name}</a>
        <button type="button" className={`${s.ghost} ${saved ? s.saved : ''}`} onClick={() => saved ? unsaveTool(tool.name) : saveTool(tool.name)}>
          <Glyph value="ph:star" size={13} weight={saved ? 'fill' : 'bold'} /> {saved ? 'Salva' : 'Salvar'}
        </button>
        {onRemoveFromHub && <button type="button" className={s.ghost} onClick={onRemoveFromHub} title="Tirar esta ferramenta da biblioteca deste hub">Tirar do hub</button>}
      </div>
    </div>
  )
}
