import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../firebase'
import { getStoredGCalToken, storeGCalToken, clearGCalToken } from '../hooks/useGoogleCalendar'
import { useDeadlinesStore } from '../store/deadlinesStore'
import { useLinksStore } from '../store/linksStore'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useWorkspacesStore } from '../store/workspacesStore'
import { useTasksStore } from '../store/tasksStore'
import { useHubsStore } from '../store/hubsStore'
import { useContentItemsStore } from '../store/contentItemsStore'
import { useSavedToolsStore } from '../store/savedToolsStore'
import { useChatMessagesStore } from '../store/chatMessagesStore'
import { useLibraryStore } from '../store/libraryStore'

const GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'

interface AuthCtx {
  user: User | null
  loading: boolean
  googleAccessToken: string | null
  signInWithGoogle: () => Promise<void>
  requestCalendarAccess: () => Promise<void>
  sendEmailLink: (email: string) => Promise<void>
  /** True when the page was opened from a sign-in link but we don't know which e-mail it was sent to. */
  emailLinkNeedsEmail: boolean
  completeEmailLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const EMAIL_FOR_LINK_KEY = 'formcraft-email-for-signin'

function clearSignInParams() {
  window.history.replaceState(null, '', window.location.pathname + window.location.hash)
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
  'formcraft-chat-messages',
  'formcraft-tasks',
  'formcraft-library',
]

const SESSION_UID_KEY = 'formcraft-session-uid'

function clearDataStores() {
  DATA_STORE_KEYS.forEach(k => localStorage.removeItem(k))
  // Wipe in-memory Zustand stores so stale data isn't visible
  // during the window between auth change and FirestoreSync re-hydration.
  useLinksStore.getState().hydrate([])
  useAreasStore.getState().hydrate([])
  useAreaItemsStore.getState().hydrate([])
  useCollectionsStore.getState().hydrate([])
  useWorkspacesStore.getState().hydrate([])
  useContentItemsStore.getState().hydrate([])
  useTasksStore.getState().hydrate([])
  useSavedToolsStore.getState().hydrate([])
  useHubsStore.getState().hydrateHubs([])
  useHubsStore.getState().hydrateSemesters([])
  useHubsStore.getState().hydrateSubjects([])
  useHubsStore.getState().hydrateClasses([])
  useHubsStore.getState().hydrateContents([])
  useHubsStore.getState().hydrateChats([])
  useHubsStore.getState().hydrateChatMessages([])
  useHubsStore.getState().hydrateConcepts([])
  useLibraryStore.setState({ patterns: [], seeded: false })
  useChatMessagesStore.setState({ messages: [] })
  useDeadlinesStore.setState({ deadlines: [] })
  localStorage.removeItem('formcraft-deadlines')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => getStoredGCalToken())

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      const prevUid = localStorage.getItem(SESSION_UID_KEY)

      if (u) {
        if (prevUid && prevUid !== u.uid) {
          // Different user logged in — clear previous user's data from localStorage and memory
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

  const [emailLinkNeedsEmail, setEmailLinkNeedsEmail] = useState(false)

  // Opened from the e-mail sign-in link: finish signing in with the address saved when the link was sent.
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return
    const saved = localStorage.getItem(EMAIL_FOR_LINK_KEY)
    if (!saved) { setEmailLinkNeedsEmail(true); return }
    signInWithEmailLink(auth, saved, window.location.href)
      .then(() => { localStorage.removeItem(EMAIL_FOR_LINK_KEY); clearSignInParams() })
      .catch(() => setEmailLinkNeedsEmail(true))
  }, [])

  function _extractAndStoreToken(result: import('firebase/auth').UserCredential) {
    const cred = GoogleAuthProvider.credentialFromResult(result)
    if (cred?.accessToken) {
      storeGCalToken(cred.accessToken)
      setGoogleAccessToken(cred.accessToken)
    }
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.addScope(GCAL_SCOPE)
    const result = await signInWithPopup(auth, provider)
    _extractAndStoreToken(result)
  }

  async function requestCalendarAccess() {
    const provider = new GoogleAuthProvider()
    provider.addScope(GCAL_SCOPE)
    const result = await signInWithPopup(auth, provider)
    _extractAndStoreToken(result)
  }

  async function sendEmailLink(email: string) {
    await sendSignInLinkToEmail(auth, email, {
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: true,
    })
    localStorage.setItem(EMAIL_FOR_LINK_KEY, email)
  }

  async function completeEmailLink(email: string) {
    await signInWithEmailLink(auth, email, window.location.href)
    localStorage.removeItem(EMAIL_FOR_LINK_KEY)
    setEmailLinkNeedsEmail(false)
    clearSignInParams()
  }

  async function signOut() {
    clearGCalToken()
    setGoogleAccessToken(null)
    await fbSignOut(auth)
  }

  return (
    <Ctx.Provider value={{ user, loading, googleAccessToken, signInWithGoogle, requestCalendarAccess, sendEmailLink, emailLinkNeedsEmail, completeEmailLink, signOut }}>
      {children}
    </Ctx.Provider>
  )
}
