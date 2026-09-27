import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// The browser fires this once, early, so it is captured at module load (imported from main.tsx).
let deferred: BeforeInstallPromptEvent | null = null
let installed = typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true)
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e as BeforeInstallPromptEvent; emit() })
  window.addEventListener('appinstalled', () => { installed = true; deferred = null; emit() })
}

const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)

let snapshot = { canPrompt: !!deferred, installed, isIOS }
function getSnapshot() {
  if (snapshot.canPrompt !== !!deferred || snapshot.installed !== installed) snapshot = { canPrompt: !!deferred, installed, isIOS }
  return snapshot
}
function subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb) } }

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  await deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  emit()
  return outcome === 'accepted'
}

/** canPrompt: the browser can show its install dialog. On iPhone there is no dialog; the user adds it via Share. */
export function usePwaInstall() {
  const s = useSyncExternalStore(subscribe, getSnapshot)
  return { ...s, available: !s.installed && (s.canPrompt || s.isIOS) }
}
