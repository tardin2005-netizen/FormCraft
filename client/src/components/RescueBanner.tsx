import { useState } from 'react'
import { CloudUpload, ChevronDown, ChevronUp } from 'lucide-react'
import { useRescueStore, RESCUE_LABELS, itemLabel } from '../store/rescueStore'
import s from './RescueBanner.module.css'

export default function RescueBanner() {
  const { stash, uploading, result, upload, discard } = useRescueStore()
  const [open, setOpen] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const groups = Object.entries(stash).filter(([, items]) => items.length)
  const total = groups.reduce((n, [, items]) => n + items.length, 0)

  if (!total) {
    if (!result) return null
    return (
      <div className={`${s.banner} ${s.done}`} role="status">
        <CloudUpload size={18} />
        <p className={s.text}><b>{result.ok} {result.ok === 1 ? 'item enviado' : 'itens enviados'} para a nuvem.</b> Eles já aparecem em todos os seus aparelhos.</p>
      </div>
    )
  }

  const summary = groups.map(([k, items]) => {
    const [one, many] = RESCUE_LABELS[k] ?? [k, k]
    return `${items.length} ${items.length === 1 ? one : many}`
  }).join(', ')

  return (
    <div className={s.banner} role="region" aria-label="Itens salvos só neste navegador">
      <CloudUpload size={18} className={s.icon} />
      <div className={s.body}>
        <p className={s.text}>
          <b>Encontramos {total} {total === 1 ? 'item salvo' : 'itens salvos'} só neste navegador</b> ({summary}).
          Eles não chegaram à nuvem por uma falha que já foi corrigida. Envie para não perder.
        </p>
        {result && result.failed > 0 && (
          <p className={s.error}>{result.failed} não {result.failed === 1 ? 'pôde' : 'puderam'} ser {result.failed === 1 ? 'enviado' : 'enviados'}. Verifique a conexão e tente de novo.</p>
        )}
        {open && (
          <ul className={s.list}>
            {groups.map(([k, items]) => items.map(it => (
              <li key={k + it.id}><span className={s.kind}>{(RESCUE_LABELS[k] ?? [k])[0]}</span>{itemLabel(it)}</li>
            )))}
          </ul>
        )}
        <div className={s.actions}>
          <button className={s.primary} onClick={upload} disabled={uploading}>{uploading ? 'Enviando…' : 'Enviar para a nuvem'}</button>
          <button className={s.secondary} onClick={() => setOpen(v => !v)} aria-expanded={open}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {open ? 'Esconder lista' : 'Ver itens'}
          </button>
          {confirmDiscard ? (
            <span className={s.confirm}>
              Descartar a cópia? Os itens somem deste navegador.
              <button className={s.danger} onClick={() => { discard(); setConfirmDiscard(false) }}>Descartar</button>
              <button className={s.secondary} onClick={() => setConfirmDiscard(false)}>Cancelar</button>
            </span>
          ) : (
            <button className={s.link} onClick={() => setConfirmDiscard(true)} disabled={uploading}>Não enviar</button>
          )}
        </div>
      </div>
    </div>
  )
}
