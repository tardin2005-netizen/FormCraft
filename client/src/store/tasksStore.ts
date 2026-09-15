import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore'

export type TaskStatus    = 'todo' | 'doing' | 'done'
export type TaskUrgency   = 'low' | 'medium' | 'high' | 'urgent'
export type TaskRecurrence = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface SubTask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  urgency: TaskUrgency
  recurrence: TaskRecurrence
  area?: string
  description?: string
  dueDate?: string
  tags: string[]
  subtasks: SubTask[]
  createdAt: string
  completedAt?: string
}

interface TasksStore {
  tasks: Task[]
  hydrate: (tasks: Task[]) => void
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
}

function uid() { return auth.currentUser?.uid }

function saveToFirestore(task: Task) {
  const u = uid()
  if (!u) return
  setDoc(doc(collection(doc(db, 'users', u), 'tasks'), task.id), task)
}

function deleteFromFirestore(id: string) {
  const u = uid()
  if (!u) return
  deleteDoc(doc(collection(doc(db, 'users', u), 'tasks'), id))
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      hydrate: (tasks) => set({ tasks }),

      addTask: (data) => {
        const task: Task = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set(s => ({ tasks: [task, ...s.tasks] }))
        saveToFirestore(task)
      },

      updateTask: (id, updates) => {
        const tasks = get().tasks.map(t => {
          if (t.id !== id) return t
          const updated = { ...t, ...updates }
          if (updates.status === 'done' && t.status !== 'done') {
            updated.completedAt = new Date().toISOString()
          }
          if (updates.status && updates.status !== 'done') {
            updated.completedAt = undefined
          }
          return updated
        })
        set({ tasks })
        const task = tasks.find(t => t.id === id)
        if (task) saveToFirestore(task)
      },

      deleteTask: (id) => {
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
        deleteFromFirestore(id)
      },
    }),
    { name: 'formcraft-tasks' }
  )
)
