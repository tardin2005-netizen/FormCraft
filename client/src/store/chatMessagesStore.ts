import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

export interface ChatMessage {
  id: string
  chatId: string
  text: string
  fileData?: string
  fileName?: string
  fileType?: string
  timestamp: string
}

interface ChatMessagesStore {
  messages: ChatMessage[]
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  deleteMessage: (id: string) => void
  getByChat: (chatId: string) => ChatMessage[]
}

function docRef(uid: string, id: string) {
  return doc(db, 'users', uid, 'chatMessages', id)
}

export const useChatMessagesStore = create<ChatMessagesStore>()(
  persist(
    (set, get) => ({
      messages: [],
      addMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        }
        set(s => ({ messages: [...s.messages, newMsg] }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(docRef(uid, newMsg.id), newMsg).catch(() => {})
      },
      deleteMessage: (id) => {
        set(s => ({ messages: s.messages.filter(m => m.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(docRef(uid, id)).catch(() => {})
      },
      getByChat: (chatId) => get().messages.filter(m => m.chatId === chatId),
    }),
    { name: 'formcraft-chat-messages' }
  )
)
