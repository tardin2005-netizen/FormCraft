import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHubsStore } from '../store/hubsStore'

const SEED_KEY = 'formcraft-seed-storytelling-ado3b-2026-11-25-v1'
const HUB_ID = '83b8b5a9-3cad-45f5-b780-edcb97fd126c'
const TITLE = 'ADO 3 · Parte B — Trabalho em grupo (apresentação)'

/** Cadastra a única entrega futura de Storytelling: ADO 3 Parte B, 25/11/2026 (vale 8,0). */
export function useSeedStorytellingADO() {
  const { user } = useAuth()
  const { subjects, classes, addClassItem } = useHubsStore()

  useEffect(() => {
    if (!user || localStorage.getItem(SEED_KEY)) return
    const hubSubjects = subjects.filter(s => s.hubId === HUB_ID)
    if (hubSubjects.length < 15) return // espera o Firestore carregar
    const subject = hubSubjects.find(s => /storytelling/i.test(s.name))
    if (!subject) return
    if (!classes.some(c => c.subjectId === subject.id && c.title === TITLE)) {
      addClassItem({
        hubId: HUB_ID,
        semesterId: subject.semesterId,
        subjectId: subject.id,
        title: TITLE,
        type: 'trabalho',
        date: '2026-11-25',
        notes: 'Avaliações da matéria: 1 dinâmica em sala + 1 prova + 1 trabalho em grupo (ADO1, ADO2 e ADO3). A parte B do ADO 3 vale 8,0 e a parte A (14/10) valia 2,0.',
      })
    }
    localStorage.setItem(SEED_KEY, '1')
  }, [user, subjects, classes, addClassItem])
}
