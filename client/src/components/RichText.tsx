import type { ReactNode } from 'react'
import s from './RichText.module.css'

const BULLET = /^\s*(?:[*•–-])\s+/

/** Adds the missing space in pasted text like "computador.Identifica" or "Web).O navegador". */
export function tidyText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/([a-zà-ÿ)\]])([.!?:;])([A-ZÀ-Ý])/g, '$1$2 $3')
}

function inline(text: string): ReactNode[] {
  // **bold**; leftover lone ** markers from pasted Markdown are dropped
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part) ? <strong key={i}>{part.slice(2, -2)}</strong> : part.replace(/\*\*/g, ''),
  )
}

/**
 * Renders user text keeping its structure: blank lines split paragraphs, single line breaks stay,
 * lines starting with *, -, – or • become a bulleted list.
 */
export default function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = tidyText(text).split(/\n\s*\n/).map(b => b.split('\n').map(l => l.trimEnd()).filter(l => l.trim()))
  const out: ReactNode[] = []

  blocks.forEach((lines, bi) => {
    let para: string[] = []
    let list: string[] = []
    const flushPara = () => {
      if (!para.length) return
      out.push(<p key={`p${bi}-${out.length}`}>{para.map((l, i) => <span key={i}>{i > 0 && <br />}{inline(l.trim())}</span>)}</p>)
      para = []
    }
    const flushList = () => {
      if (!list.length) return
      out.push(<ul key={`u${bi}-${out.length}`}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>)
      list = []
    }
    for (const line of lines) {
      if (BULLET.test(line)) { flushPara(); list.push(line.replace(BULLET, '')) }
      else { flushList(); para.push(line) }
    }
    flushPara(); flushList()
  })

  return <div className={`${s.rich} ${className ?? ''}`}>{out}</div>
}

/** One-line preview for cards: tidied, without Markdown markers. */
export function plainText(text: string) {
  return tidyText(text).replace(/\*\*/g, '').replace(/^\s*[*•–-]\s+/gm, '• ').replace(/\s*\n\s*/g, ' ')
}
