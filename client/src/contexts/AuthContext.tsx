import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../firebase'

interface AuthCtx {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(Ctx)

// localStorage keys for data stores (NOT prefs like theme/sidebar)
const DATA_STORE_KEYS = [
  'formcraft-links',
  'formcraft-areas',
  'formcraft-area-items',
  'formcraft-collections',
  'formcraft-hubs',
  'formcraft-workspaces',
  'formcraft-content-items',
  'formcraft-saved-tools',
]

const SESSION_UID_KEY = 'formcraft-session-uid'

function clearDataStores() {
  DATA_STORE_KEYS.forEach(k => localStorage.removeItem(k))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      const prevUid = localStorage.getItem(SESSION_UID_KEY)

      if (u) {
        if (prevUid && prevUid !== u.uid) {
          // Different user logged in — clear previous user's data from localStorage
          clearDataStores()
        }
        localStorage.setItem(SESSION_UID_KEY, u.uid)
      } else {
        // Logged out — clear data so next user starts fresh
        clearDataStores()
        localStorage.removeItem(SESSION_UID_KEY)
      }

      setUser(u)
      setLoading(false)
    })
  }, [])

  async function signInWithGoogle() {
    await signInWithPopup(auth, new GoogleAuthProvider())
  }

  async function signOut() {
    await fbSignOut(auth)
  }

  return (
    <Ctx.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  )
}
