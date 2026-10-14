import type { DesignPattern } from '../store/libraryStore'
import s from './PatternPreview.module.css'

const norm = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const BG: Record<string, string> = {
  hamburger: '#ffb347', resize: '#ffb347', sidebar: '#ffb347',
  hover: '#e9e4ff', motion: '#d9fbea', gradient: '#fff3df', floatcard: '#e9e4ff', floatel: '#ffe3e8',
  pwa: '#dcefff', type: '#fff3df', colors: '#f1ecff', components: '#e6e8f0', button: '#ffb347',
  input: '#eef0f7', badge: '#d9fbea', tooltip: '#e9e4ff', fallback: '#e6e8f0',
}

function keyOf(p: DesignPattern): string {
  const n = norm(p.nomePrincipal)
  if (n.includes('hamburguer')) return 'hamburger'
  if (n.includes('resize')) return 'resize'
  if (n.includes('sidebar')) return 'sidebar'
  if (n.includes('gradient')) return 'gradient'
  if (n.includes('floating card')) return 'floatcard'
  if (n.includes('floating')) return 'floatel'
  if (n.includes('pwa')) return 'pwa'
  if (n.includes('tipografia')) return 'type'
  if (n === 'cores') return 'colors'
  if (n.includes('componentes')) return 'components'
  if (n.includes('botao')) return 'button'
  if (n.includes('campo')) return 'input'
  if (n.includes('badge')) return 'badge'
  if (n.includes('tooltip')) return 'tooltip'
  if (n === 'hover') return 'hover'
  if (n === 'motion') return 'motion'
  return 'fallback'
}

function Demo({ k, p }: { k: string; p: DesignPattern }) {
  switch (k) {
    case 'hamburger':
      return (
        <div className={s.phone}>
          <div className={s.drawer}><i /><i /><i /></div>
          <div className={s.burger}><b /><b /><b /></div>
        </div>
      )
    case 'resize':
      return (
        <div className={s.split}>
          <div className={s.resizeSide}><i /><i /><i /><span className={s.grip} /></div>
          <div className={s.splitMain}><i /><i /></div>
        </div>
      )
    case 'sidebar':
      return (
        <div className={s.split}>
          <div className={s.collapseSide}>
            {[0, 1, 2].map(n => <div key={n} className={s.navRow}><u /><em /></div>)}
          </div>
          <div className={s.splitMain}><i /><i /></div>
        </div>
      )
    case 'hover':
      return (
        <div className={s.hoverWrap}>
          <div className={s.hoverCard}><i /><i /></div>
          <svg className={s.cursor} viewBox="0 0 24 24" width="22" height="22"><path d="M5 3l14 8-6 2-3 6z" fill="#1a1a2e" /></svg>
        </div>
      )
    case 'motion':
      return (
        <div className={s.track}>
          <div className={s.ball} />
          <div className={s.trail} />
        </div>
      )
    case 'gradient':
      return <div className={s.gradText}>Aa Gradient</div>
    case 'floatcard':
      return (
        <div className={s.floatCardWrap}>
          <div className={s.floatCard}><div className={s.floatCardImg} /><i /></div>
          <div className={s.floatShadow} />
        </div>
      )
    case 'floatel':
      return <div className={s.blob} />
    case 'pwa':
      return (
        <div className={s.phone}>
          <div className={s.installBanner}>Instalar app</div>
          <div className={s.appIcon}>F</div>
        </div>
      )
    case 'type':
      return (
        <div className={s.typeStack}>
          <div className={s.t1}>Display</div>
          <div className={s.t2}>Headline</div>
          <div className={s.t3}>Body text</div>
          <div className={s.t4}>Caption</div>
        </div>
      )
    case 'colors':
      return (
        <div className={s.swatches}>
          {['#5b3df0', '#ff4d6d', '#2ee59d', '#ffb347', '#4aa8ff', '#9aa0b4'].map((c, i) => (
            <span key={c} style={{ background: c, animationDelay: `${i * 0.25}s` }} />
          ))}
        </div>
      )
    case 'components':
      return (
        <div className={s.compGrid}>
          <div className={s.cBtn} />
          <div className={s.cInput} />
          <div className={s.cBadge} />
          <div className={s.cCard} />
        </div>
      )
    case 'button':
      return (
        <div className={s.btnWrap}>
          <div className={s.btnDemo}>Enviar</div>
          <div className={s.btnGhost}>Cancelar</div>
        </div>
      )
    case 'input':
      return (
        <div className={s.inputWrap}>
          <small>E-mail</small>
          <div className={s.inputDemo}><span className={s.typed}>ana@mail.com</span></div>
          <small className={s.inputMsg}>Informe um e-mail válido</small>
        </div>
      )
    case 'badge':
      return (
        <div className={s.pills}>
          <span style={{ background: '#fde68a', color: '#78350f' }}>Rascunho</span>
          <span style={{ background: '#a7f3d0', color: '#064e3b', animationDelay: '.4s' }}>Publicado</span>
          <span style={{ background: '#fecdd3', color: '#881337', animationDelay: '.8s' }}>Erro</span>
          <span className={s.tagPill} style={{ animationDelay: '1.2s' }}>#tag</span>
        </div>
      )
    case 'tooltip':
      return (
        <div className={s.tipWrap}>
          <div className={s.tip}>Campo obrigatório</div>
          <div className={s.tipBtn}>?</div>
        </div>
      )
    default:
      return <div className={s.fallbackBox}>{p.categoria.slice(0, 2)}</div>
  }
}

export default function PatternPreview({ pattern, large = false }: { pattern: DesignPattern; large?: boolean }) {
  if (pattern.exemploImagem) {
    return (
      <div className={`${s.stage} ${large ? s.large : ''}`} style={{ background: 'var(--surface2)' }}>
        <img className={s.userImg} src={pattern.exemploImagem} alt={pattern.nomePrincipal} />
      </div>
    )
  }
  const k = keyOf(pattern)
  return (
    <div className={`${s.stage} ${large ? s.large : ''}`} style={{ background: BG[k] }} aria-hidden="true">
      <Demo k={k} p={pattern} />
    </div>
  )
}
