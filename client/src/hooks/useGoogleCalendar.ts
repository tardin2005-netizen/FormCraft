import { useState, useEffect } from 'react'

export interface GCalEvent {
  id: string
  summary: string
  date: string        // YYYY-MM-DD
  startTime?: string  // HH:MM (only for timed events)
  htmlLink: string
}

const GCAL_TOKEN_KEY = 'formcraft-gat'

export function getStoredGCalToken(): string | null {
  try { return sessionStorage.getItem(GCAL_TOKEN_KEY) } catch { return null }
}

export function storeGCalToken(token: string) {
  try { sessionStorage.setItem(GCAL_TOKEN_KEY, token) } catch { /* ignore */ }
}

export function clearGCalToken() {
  try { sessionStorage.removeItem(GCAL_TOKEN_KEY) } catch { /* ignore */ }
}

export function useGoogleCalendar(accessToken: string | null) {
  const [events, setEvents] = useState<GCalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)

  useEffect(() => {
    if (!accessToken) { setEvents([]); return }
    setLoading(true)
    setTokenExpired(false)

    const now = new Date().toISOString()
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
      `?timeMin=${encodeURIComponent(now)}&timeMax=${encodeURIComponent(future)}` +
      `&maxResults=50&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
      .then(r => {
        if (r.status === 401) { setTokenExpired(true); clearGCalToken(); throw new Error('expired') }
        if (!r.ok) throw new Error(`gcal ${r.status}`)
        return r.json()
      })
      .then((data: { items?: any[] }) => {
        const items = data.items ?? []
        setEvents(
          items
            .map(ev => ({
              id: ev.id as string,
              summary: (ev.summary as string | undefined) ?? '(sem título)',
              date: (ev.start?.date ?? ev.start?.dateTime?.slice(0, 10) ?? '') as string,
              startTime: ev.start?.dateTime ? (ev.start.dateTime as string).slice(11, 16) : undefined,
              htmlLink: (ev.htmlLink as string | undefined) ?? '',
            }))
            .filter(ev => ev.date)
        )
        setLoading(false)
      })
      .catch(err => {
        if ((err as Error).message !== 'expired') console.error('[GCal]', err)
        setLoading(false)
      })
  }, [accessToken])

  return { events, loading, tokenExpired }
}
