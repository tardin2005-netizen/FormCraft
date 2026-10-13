import s from './Logotipo.module.css'

export default function Logotipo({ height = 36, flush = false, vertical = false, className = '' }: { height?: number; flush?: boolean; vertical?: boolean; className?: string }) {
  const width = Math.round(height * (vertical ? 458 / 417 : 796 / 240))
  const pad = flush && !vertical ? Math.round(height * 0.14) : 0
  const style = pad ? { marginLeft: -pad, marginRight: -pad } : undefined
  const base = vertical ? 'logotipo-vertical' : 'logotipo'
  return (
    <>
      <img src={`/${base}-claro.png`} alt="Formcraft" width={width} height={height} className={`${s.light} ${className}`} style={style} />
      <img src={`/${base}-escuro.png`} alt="" aria-hidden="true" width={width} height={height} className={`${s.dark} ${className}`} style={style} />
    </>
  )
}
