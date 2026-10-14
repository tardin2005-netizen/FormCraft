import { PH_BY_KEY, EMOJI_TO_PH } from '../data/phosphor'

interface Props {
  /** "ph:rocket-launch" (new) or an emoji saved earlier (shown as its matching icon when known). */
  value?: string
  size?: number
  className?: string
  color?: string
  weight?: 'bold' | 'fill' | 'regular'
}

export function phKeyOf(value?: string): string | undefined {
  const v = (value ?? '').replace(/️/g, '')
  return v.startsWith('ph:') ? v.slice(3) : EMOJI_TO_PH[v]
}

export default function Glyph({ value, size = 18, className, color, weight = 'bold' }: Props) {
  const key = phKeyOf(value)
  const C = key ? PH_BY_KEY[key] : undefined
  if (C) return <C size={size} weight={weight} color={color} className={className} aria-hidden="true" />
  return <span className={className} style={{ fontSize: size, lineHeight: 1, color }} aria-hidden="true">{value}</span>
}
