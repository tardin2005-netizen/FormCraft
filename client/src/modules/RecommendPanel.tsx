import type { Tool } from '../data/tools'
import type { DesignPattern } from '../store/libraryStore'
import type { Hub } from '../store/hubsStore'
import ToolTile from './ToolTile'
import PatternPreview from './PatternPreview'
import s from './RecommendPanel.module.css'

interface Props {
  query: string
  tools: Tool[]
  patterns: DesignPattern[]
  hubsOfTool?: (t: Tool) => Hub[]
  onOpenPattern: (p: DesignPattern) => void
  /** Offered when the hub's own tools had nothing for the request. */
  onSearchAll?: () => void
}

export default function RecommendPanel({ query, tools, patterns, hubsOfTool, onOpenPattern, onSearchAll }: Props) {
  return (
    <div className={s.panel}>
      <div className={s.intent}>Entendi: “{query.trim()}”. Separei o que serve para isso.</div>
      <div className={s.cols}>
        <div className={s.col}>
          <div className={s.colTitle}>Ferramentas recomendadas <span className={s.colSub}>{tools.length ? `${Math.min(tools.length, 4)} de ${tools.length}` : ''}</span></div>
          {tools.length === 0 ? (
            <div className={s.none}>
              Nenhuma ferramenta deste hub combina com esse pedido.
              {onSearchAll && <button type="button" className={s.moreBtn} onClick={onSearchAll}>Procurar em todas as ferramentas</button>}
            </div>
          ) : tools.slice(0, 4).map(t => <ToolTile key={t.name} tool={t} hubs={hubsOfTool?.(t)} />)}
        </div>
        <div className={s.col}>
          <div className={s.colTitle}>Da sua biblioteca <span className={s.colSub}>técnicas e padrões</span></div>
          {patterns.length === 0
            ? <div className={s.none}>Nenhum padrão seu fala disso ainda.</div>
            : patterns.slice(0, 4).map(p => (
              <button key={p.id} type="button" className={s.patBtn} onClick={() => onOpenPattern(p)}>
                <PatternPreview pattern={p} />
                <span className={s.patBody}>
                  <span className={s.patCat}>{p.categoria}</span>
                  <span className={s.patTitle}>{p.nomePrincipal}</span>
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
