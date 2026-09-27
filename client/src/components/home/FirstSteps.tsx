import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useHubsStore } from '../../store/hubsStore'
import { useAuth } from '../../contexts/AuthContext'
import s from './Home.module.css'

export default function FirstSteps() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hubs, semesters, contents } = useHubsStore()
  const storageKey = `formcraft-first-steps-dismissed-${user?.uid ?? 'anon'}`
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem(storageKey) === '1' } catch { return false } })

  const hub = hubs.find(h => h.type === 'faculdade') ?? hubs[0]
  const steps = [
    {
      done: hubs.length > 0,
      title: 'Criar o hub da faculdade',
      desc: hub ? hub.name : 'Um espaço com semestres, matérias e aulas.',
      action: 'Criar hub',
      go: () => navigate('/hubs?novo=1'),
    },
    {
      done: semesters.length > 0,
      title: 'Adicionar o semestre atual',
      desc: 'Depois, as matérias dele.',
      action: 'Adicionar semestre',
      go: () => hub && navigate(`/hub/${hub.id}?novo=semestre`),
    },
    {
      done: contents.some(c => c.type === 'pdf'),
      title: 'Enviar o primeiro PDF',
      desc: 'Arraste o slide de uma aula.',
      action: 'Enviar PDF',
      go: () => hub && navigate(`/hub/${hub.id}?novo=material`),
    },
  ]
  const doneCount = steps.filter(x => x.done).length
  if (dismissed || doneCount === steps.length) return null
  const current = steps.findIndex(x => !x.done)

  function dismiss() {
    setDismissed(true)
    try { localStorage.setItem(storageKey, '1') } catch { /* ignore */ }
  }

  return (
    <section className={s.steps} aria-labelledby="first-steps-title">
      <div className={s.stepsHead}>
        <div>
          <p className={s.stepsCount}>{doneCount} de {steps.length} concluído{doneCount === 1 ? '' : 's'}</p>
          <h2 id="first-steps-title" className={s.stepsTitle}>Monte seu caderno em 2 minutos</h2>
        </div>
        <button className={s.stepsClose} onClick={dismiss} aria-label="Dispensar primeiros passos"><X size={16} /></button>
      </div>
      <div className={s.stepsBar} role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount}>
        <i style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ol className={s.stepList}>
        {steps.map((st, i) => (
          <li key={st.title} className={`${s.step} ${st.done ? s.stepDone : ''} ${i === current ? s.stepNow : ''}`}>
            <span className={s.stepState}>{st.done ? <><Check size={12} /> Feito</> : i === current ? 'Agora' : 'Depois'}</span>
            <b>{st.title}</b>
            <span className={s.stepDesc}>{st.desc}</span>
            {i === current && (
              <button className={s.stepBtn} onClick={st.go} disabled={i > 0 && !hub}>{st.action}</button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
