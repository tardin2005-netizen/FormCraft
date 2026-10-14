import { createJSONStorage, type StateStorage } from 'zustand/middleware'

// The browser cache is only a convenience: Firestore is the source of truth. When localStorage is full
// (QuotaExceededError) a plain setItem throws inside the store update and aborts the cloud write that follows it.
const safeLocalStorage: StateStorage = {
  getItem: name => { try { return localStorage.getItem(name) } catch { return null } },
  setItem: (name, value) => { try { localStorage.setItem(name, value) } catch { /* cache full: keep going */ } },
  removeItem: name => { try { localStorage.removeItem(name) } catch { /* ignore */ } },
}

export const safeStorage = createJSONStorage(() => safeLocalStorage)
