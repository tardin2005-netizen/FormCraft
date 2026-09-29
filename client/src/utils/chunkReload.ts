// After a new deploy, a tab opened before it still points to old file names that no longer exist,
// so lazy-loaded code (like the PDF reader) fails with "Failed to fetch dynamically imported module".
// Reloading once picks up the new files.

const KEY = 'formcraft-chunk-reload-at'

export function isChunkLoadError(err: unknown) {
  const msg = String((err as { message?: string })?.message ?? err)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Loading chunk|Outdated Optimize Dep/i.test(msg)
}

/** Reloads the page unless it already did so in the last 30s (avoids reload loops). Returns true if reloading. */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0)
    if (Date.now() - last < 30_000) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch { /* storage blocked: still reload once */ }
  window.location.reload()
  return true
}

window.addEventListener('vite:preloadError', event => {
  if (reloadOnce()) event.preventDefault()
})
