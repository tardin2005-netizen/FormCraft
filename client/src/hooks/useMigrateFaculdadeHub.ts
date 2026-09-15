import { useEffect } from 'react'
import { useHubsStore } from '../store/hubsStore'

const MIGRATION_KEY = 'formcraft-migration-faculdade-semesters-v1'
const HUB_ID = '83b8b5a9-3cad-45f5-b780-edcb97fd126c'
const SEM1 = '1a19e9f3-db57-4533-93d6-c9787d73f286'
const SEM2 = '7070c977-cedb-4781-9439-7d6374b85179'
const SEM3 = 'a95c4f52-a6f1-4fb9-8182-0535d1ef71e0'

// Subjects wrongly in 3º that belong in 2º
const MOVE_TO_SEM2 = new Set([
  '25e57595-0918-4589-9889-49c8b570d24b', // Gestão da Comunicação Mercadológica
  '551ada4a-eff3-41da-bf64-4b9011afe9a6', // Produtos, Serviços e Sociedade
  '7928eb40-ab44-4aca-844b-def440e7764e', // Gestão de Canais de Marketing
  'f380664f-5e33-4b80-a322-d4f83a4246f8', // Gestão de Serviços
])

// Name corrections to match official timetable
const RENAMES: Record<string, string> = {
  '8efe2d24-70cc-4e28-89ba-62380121de93': 'Storytelling e Narrativas de Marca',
  'ad6161d1-8275-4804-9822-bcb1fcf21c82': 'Métricas Para Marketing Digital',
}

// Subjects missing entirely — verified against official SENAC timetables
const MISSING_SUBJECTS = [
  // 1º semestre (STMKTCAS1NA)
  { semesterId: SEM1, name: 'Comportamento do Consumidor e Consumer Insights', emoji: '🧠', color: '#6366f1' },
  { semesterId: SEM1, name: 'Gestão Mercadológica', emoji: '📊', color: '#6366f1' },
  // 2º semestre (STMKTCAS2NA)
  { semesterId: SEM2, name: 'Projeto: Análise de Composto Mercadológico', emoji: '📋', color: '#6366f1' },
  // 3º semestre (STMKTCAS3NA)
  { semesterId: SEM3, name: 'Estratégias Digitais', emoji: '💻', color: '#6366f1' },
  { semesterId: SEM3, name: 'Liderança, Ética e Tecnologia', emoji: '🌟', color: '#6366f1' },
  { semesterId: SEM3, name: 'Projeto: Planejamento Estratégico de Marketing', emoji: '🎯', color: '#6366f1' },
  { semesterId: SEM3, name: 'Tecnologias Emergentes em Gestão', emoji: '🚀', color: '#6366f1' },
  { semesterId: SEM3, name: 'Desenvolvimento de Competências Socioemocionais', emoji: '🤝', color: '#6366f1' },
]

export function useMigrateFaculdadeHub() {
  const { subjects, updateSubject, addSubject } = useHubsStore()

  useEffect(() => {
    if (localStorage.getItem(MIGRATION_KEY)) return

    const hubSubjects = subjects.filter(s => s.hubId === HUB_ID)
    if (hubSubjects.length === 0) return // Wait for Firestore hydration

    // Move subjects to correct semester and fix names
    for (const s of hubSubjects) {
      if (MOVE_TO_SEM2.has(s.id) && s.semesterId !== SEM2) {
        updateSubject(s.id, { semesterId: SEM2 })
      }
      if (RENAMES[s.id] && s.name !== RENAMES[s.id]) {
        updateSubject(s.id, { name: RENAMES[s.id] })
      }
    }

    // Add missing subjects (skip if already exists by name)
    const existingNames = new Set(hubSubjects.map(s => s.name))
    for (const sub of MISSING_SUBJECTS) {
      if (!existingNames.has(sub.name)) {
        addSubject({ ...sub, hubId: HUB_ID })
      }
    }

    localStorage.setItem(MIGRATION_KEY, '1')
  }, [subjects, updateSubject, addSubject])
}
